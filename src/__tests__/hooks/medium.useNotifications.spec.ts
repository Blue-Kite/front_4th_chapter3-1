import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const now = new Date('2025-02-06T10:00:00');

const events: Event[] = [
  {
    id: '1',
    title: '곧 시작할 회의',
    date: formatDate(now),
    startTime: parseHM(now.getTime() + 20 * minute),
    endTime: parseHM(now.getTime() + 75 * minute),
    description: '테스트 회의',
    location: '회의실 1',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '나중 회의',
    date: formatDate(now),
    startTime: parseHM(now.getTime()),
    endTime: parseHM(now.getTime() + 2 * hour),
    description: '테스트 회의 2',
    location: '회의실 2',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
];

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(events));

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.notifiedEvents).toHaveLength(0);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const { result } = renderHook(() => useNotifications(events));
    expect(result.current.notifications).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(10 * minute);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toMatchObject({
      id: '1',
      message: expect.stringContaining('곧 시작할 회의'),
    });
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(10 * minute);
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(10 * minute);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toContain('1');

    act(() => {
      vi.advanceTimersByTime(5 * minute);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toContain('1');
  });
});
