import { BellIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Box,
  HStack,
  IconButton,
} from '@chakra-ui/react';

import { NOTIFICATIONS_OPTIONS } from '../../constants';
import { Event } from '../../types';

interface EventSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filteredEvents: Event[];
  notifiedEvents: string[];
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export const EventSearch = ({
  searchTerm,
  onSearchChange,
  filteredEvents,
  notifiedEvents,
  onEdit,
  onDelete,
}: EventSearchProps) => {
  return (
    <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
      <FormControl>
        <FormLabel>일정 검색</FormLabel>
        <Input
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </FormControl>

      {filteredEvents.length === 0 ? (
        <Text>검색 결과가 없습니다.</Text>
      ) : (
        filteredEvents.map((event) => (
          <Box key={event.id} borderWidth={1} borderRadius="lg" p={3} width="100%">
            <HStack justifyContent="space-between">
              <VStack align="start">
                <HStack>
                  {notifiedEvents.includes(event.id) && <BellIcon color="red.500" />}
                  <Text
                    fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
                    color={notifiedEvents.includes(event.id) ? 'red.500' : 'inherit'}
                  >
                    {event.title}
                  </Text>
                </HStack>
                <Text>{event.date}</Text>
                <Text>
                  {event.startTime} - {event.endTime}
                </Text>
                <Text>{event.description}</Text>
                <Text>{event.location}</Text>
                <Text>카테고리: {event.category}</Text>
                {event.repeat.type !== 'none' && (
                  <Text>
                    반복: {event.repeat.interval}
                    {event.repeat.type === 'daily' && '일'}
                    {event.repeat.type === 'weekly' && '주'}
                    {event.repeat.type === 'monthly' && '월'}
                    {event.repeat.type === 'yearly' && '년'}
                    마다
                    {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
                  </Text>
                )}
                <Text>
                  알림:{' '}
                  {
                    NOTIFICATIONS_OPTIONS.find((option) => option.value === event.notificationTime)
                      ?.label
                  }
                </Text>
              </VStack>
              <HStack>
                <IconButton
                  aria-label="Edit event"
                  icon={<EditIcon />}
                  onClick={() => onEdit(event)}
                />
                <IconButton
                  aria-label="Delete event"
                  icon={<DeleteIcon />}
                  onClick={() => onDelete(event.id)}
                />
              </HStack>
            </HStack>
          </Box>
        ))
      )}
    </VStack>
  );
};
