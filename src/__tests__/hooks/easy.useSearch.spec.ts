import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const events: Event[] = [
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

describe('useSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-02-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

    act(() => {
      result.current.setSearchTerm('');
    });

    expect(result.current.filteredEvents).toHaveLength(3);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

    act(() => {
      result.current.setSearchTerm('아침 회의');
    });

    expect(result.current.filteredEvents).toHaveLength(2);
    expect(result.current.filteredEvents.map((event) => event.id)).toEqual(['1', '3']);
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

    act(() => {
      result.current.setSearchTerm('부서');
    });

    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0]).toEqual(events[1]);
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const { result: monthResult } = renderHook(() => useSearch(events, new Date(), 'month'));

    expect(monthResult.current.filteredEvents).toHaveLength(3);

    const { result: weekResult } = renderHook(() => useSearch(events, new Date(), 'week'));

    expect(weekResult.current.filteredEvents).toHaveLength(1);
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(events, new Date(), 'month'));
    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.filteredEvents).toEqual(events);

    act(() => {
      result.current.setSearchTerm('점심');
    });

    expect(result.current.filteredEvents).toHaveLength(1);
  });
});
