import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

const events: Event[] = [
  {
    id: '0',
    title: 'api 회의',
    date: '2025-01-31',
    startTime: '09:30',
    endTime: '11:00',
    description: '팀 미팅',
    location: '회의실 B',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
  {
    id: '1',
    title: '아침 회의',
    date: '2025-02-01',
    startTime: '09:30',
    endTime: '10:00',
    description: '팀 미팅',
    location: '회의실 B',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
  {
    id: '2',
    title: '점심 회의',
    date: '2025-02-05',
    startTime: '11:00',
    endTime: '12:00',
    description: '부서 회의',
    location: '회의실 A',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
  {
    id: '3',
    title: '아침 회의',
    date: '2025-02-06',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 미팅',
    location: '회의실 A',
    category: '미팅',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
  },
];

describe('getFilteredEvents', () => {
  it("검색어 '아침 회의'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, '아침 회의', new Date(), 'month');

    expect(result).toHaveLength(2);
    expect(result.map((event) => event.id)).toEqual(['1', '3']);
  });

  it('주간 뷰에서 2025-02-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-02-01'), 'week');

    expect(result).toHaveLength(2);
    expect(result.map((event) => event.id)).toEqual(['0', '1']);
  });

  it('월간 뷰에서 2024년 2월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-02-01'), 'month');

    expect(result).toHaveLength(3);
    expect(result.map((event) => event.id)).toEqual(['1', '2', '3']);
  });

  it("검색어 '아침 회의'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(events, '아침 회의', new Date('2025-02-01'), 'month');

    expect(result).toHaveLength(2);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-02-01'), 'month');

    expect(result).toHaveLength(3);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(events, '회의실 a', new Date(), 'month');
    const resultUpperCase = getFilteredEvents(events, '회의실 A', new Date(), 'month');

    expect(result).toEqual(resultUpperCase);
    expect(result).toHaveLength(2);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-02-01'), 'week');

    expect(result).toHaveLength(2);
    expect(result.map((event) => event.id)).toEqual(['0', '1']);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date(), 'month');

    expect(result).toHaveLength(0);
  });
});
