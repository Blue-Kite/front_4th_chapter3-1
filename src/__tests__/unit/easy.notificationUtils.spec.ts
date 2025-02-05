import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

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

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-02-01T08:30:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result[0]).toEqual(events[0]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-02-01T08:30:00');
    const notifiedEvents: string[] = ['1']; // 첫 번째 이벤트는 이미 알림이 감

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-02-01T08:00:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-02-01T09:00:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = events[0];
    const expected = '30분 후 아침 회의 일정이 시작됩니다.';

    const result = createNotificationMessage(event);

    expect(result).toBe(expected);
  });
});
