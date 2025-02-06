import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

const events: Event[] = [
  {
    id: '1',
    title: '아침 회의',
    date: '2025-02-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '팀 미팅',
    location: '장소 1',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
  {
    id: '2',
    title: '점심회의',
    date: '2025-02-05',
    startTime: '11:00',
    endTime: '12:00',
    description: '부서 회의',
    location: '장소 2',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
  {
    id: '3',
    title: '아침회의',
    date: '2025-02-06',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 미팅',
    location: '장소 3',
    category: '미팅',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
  },
];

const newEvent: Event = {
  id: '',
  title: '오후 회의',
  date: '2025-02-10',
  startTime: '14:00',
  endTime: '15:00',
  description: '개발자 전체 미팅',
  location: '장소 4',
  category: '회의',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 20,
};

const toastFn = vi.fn();
vi.mock('@chakra-ui/react', () => ({
  useToast: () => toastFn,
}));

describe('useEventOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('초기 이벤트 데이터를 적절하게 불러온다', async () => {
    setupMockHandlerCreation(events);
    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toEqual(events);
    });
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    setupMockHandlerCreation(events);
    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.saveEvent(newEvent);
    });

    await waitFor(() => {
      expect(result.current.events).toHaveLength(events.length + 1);
      const createdEvent = result.current.events[result.current.events.length - 1];
      expect(createdEvent).toMatchObject({
        ...newEvent,
        id: expect.any(String),
      });
    });
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    setupMockHandlerUpdating(events);
    const updatedEvent = {
      ...events[0],
      title: '수정된 회의',
      endTime: '11:00',
    };

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    await waitFor(() => {
      const event = result.current.events.find((e) => e.id === events[0].id);
      expect(event).toMatchObject(updatedEvent);
    });
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    setupMockHandlerDeletion(events);
    const { result } = renderHook(() => useEventOperations(false));
    const targetId = events[0].id;

    await act(async () => {
      await result.current.deleteEvent(targetId);
    });

    await waitFor(() => {
      expect(result.current.events).toHaveLength(events.length - 1);
      expect(result.current.events.find((e) => e.id === targetId)).toBeUndefined();
    });
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith({
        title: '이벤트 로딩 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      expect(result.current.events).toEqual([]);
    });
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    setupMockHandlerCreation(events);
    const { result } = renderHook(() => useEventOperations(true));

    const nonExistentEvent = {
      ...events[0],
      id: '999',
      title: '존재하지 않는 회의',
    };

    await act(async () => {
      await result.current.saveEvent(nonExistentEvent);
    });

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    server.use(
      http.delete('/api/events/:id', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    setupMockHandlerCreation(events);
    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.deleteEvent(events[0].id);
    });

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      // 삭제 실패 시 기존 이벤트 목록이 유지되어야 함
      expect(result.current.events).toHaveLength(events.length);
    });
  });
});
