import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Tooltip,
  VStack,
} from '@chakra-ui/react';

import { CATEGORIES, NOTIFICATIONS_OPTIONS } from '../../constants';
import { Event, RepeatType } from '../../types';

interface FormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  isRepeating: boolean;
  repeat: {
    type: RepeatType;
    interval: number;
    endDate: string;
  };
  notificationTime: number;
}

interface FormHandlers {
  onTitleChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onStartTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEndTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onIsRepeatingChange: (value: boolean) => void;
  onRepeatTypeChange: (value: RepeatType) => void;
  onRepeatIntervalChange: (value: number) => void;
  onRepeatEndDateChange: (value: string) => void;
  onNotificationTimeChange: (value: number) => void;
}

interface ValidationState {
  startTimeError: string | null;
  endTimeError: string | null;
}

interface EventFormEditorProps {
  formData: FormData;
  handlers: FormHandlers;
  validation: ValidationState;
  editingEvent: Event | null;
  onSubmit: () => void;
}

export const EventFormEditor = ({
  formData,
  handlers,
  validation,
  editingEvent,
  onSubmit,
}: EventFormEditorProps) => {
  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

      <FormControl>
        <FormLabel>제목</FormLabel>
        <Input value={formData.title} onChange={(e) => handlers.onTitleChange(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>날짜</FormLabel>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => handlers.onDateChange(e.target.value)}
        />
      </FormControl>

      <HStack width="100%">
        <FormControl>
          <FormLabel>시작 시간</FormLabel>
          <Tooltip
            label={validation.startTimeError}
            isOpen={!!validation.startTimeError}
            placement="top"
          >
            <Input
              type="time"
              value={formData.startTime}
              onChange={handlers.onStartTimeChange}
              isInvalid={!!validation.startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl>
          <FormLabel>종료 시간</FormLabel>
          <Tooltip
            label={validation.endTimeError}
            isOpen={!!validation.endTimeError}
            placement="top"
          >
            <Input
              type="time"
              value={formData.endTime}
              onChange={handlers.onEndTimeChange}
              isInvalid={!!validation.endTimeError}
            />
          </Tooltip>
        </FormControl>
      </HStack>

      <FormControl>
        <FormLabel>설명</FormLabel>
        <Input
          value={formData.description}
          onChange={(e) => handlers.onDescriptionChange(e.target.value)}
        />
      </FormControl>

      <FormControl>
        <FormLabel>위치</FormLabel>
        <Input
          value={formData.location}
          onChange={(e) => handlers.onLocationChange(e.target.value)}
        />
      </FormControl>

      <FormControl>
        <FormLabel>카테고리</FormLabel>
        <Select
          value={formData.category}
          onChange={(e) => handlers.onCategoryChange(e.target.value)}
        >
          <option value="">카테고리 선택</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>반복 설정</FormLabel>
        <Checkbox
          isChecked={formData.isRepeating}
          onChange={(e) => handlers.onIsRepeatingChange(e.target.checked)}
        >
          반복 일정
        </Checkbox>
      </FormControl>

      <FormControl>
        <FormLabel>알림 설정</FormLabel>
        <Select
          value={formData.notificationTime}
          onChange={(e) => handlers.onNotificationTimeChange(Number(e.target.value))}
        >
          {NOTIFICATIONS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>

      {formData.isRepeating && (
        <VStack width="100%">
          <FormControl>
            <FormLabel>반복 유형</FormLabel>
            <Select
              value={formData.repeat.type}
              onChange={(e) => handlers.onRepeatTypeChange(e.target.value as RepeatType)}
            >
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
              <option value="monthly">매월</option>
              <option value="yearly">매년</option>
            </Select>
          </FormControl>
          <HStack width="100%">
            <FormControl>
              <FormLabel>반복 간격</FormLabel>
              <Input
                type="number"
                value={formData.repeat.interval}
                onChange={(e) => handlers.onRepeatIntervalChange(Number(e.target.value))}
                min={1}
              />
            </FormControl>
            <FormControl>
              <FormLabel>반복 종료일</FormLabel>
              <Input
                type="date"
                value={formData.repeat.endDate}
                onChange={(e) => handlers.onRepeatEndDateChange(e.target.value)}
              />
            </FormControl>
          </HStack>
        </VStack>
      )}

      <Button data-testid="event-submit-button" onClick={onSubmit} colorScheme="blue">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  );
};
