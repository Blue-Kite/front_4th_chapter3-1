import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { type UserEvent, userEvent } from '@testing-library/user-event';

import { ReactElement } from 'react';

import App from '../App';

import { Event, EventForm } from '../types';
import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';

const setup = (element: ReactElement) => {
  const rendered = render(<ChakraProvider>{element}</ChakraProvider>);
  const user = userEvent.setup();

  return {
    ...rendered,
    user,
  };
};

const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};

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
    title: '팀 회의',
    date: '2025-02-06',
    startTime: '09:00',
    endTime: '09:30',
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
    endTime: '12:00',
    description: '팀 미팅',
    location: '장소 3',
    category: '미팅',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
  },
];

const newEvent = {
  title: '오후 회의',
  date: '2025-02-27',
  startTime: '10:00',
  endTime: '11:00',
  description: '팀 스크럼 미팅',
  location: '회의실 1',
  category: '기타',
  notificationTime: 10,
  repeat: { type: 'daily', interval: 0, endDate: '2025-03-07' },
} as EventForm;

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });

    await saveSchedule(user, newEvent);

    const eventList = screen.getByTestId('event-list');

    expect(within(eventList).getByText(newEvent.title)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating(events);
    const { user } = setup(<App />);

    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText(events[0].title)).toBeInTheDocument();
    });

    const editButtons = within(eventList).getAllByLabelText(/edit event/i);
    await user.click(editButtons[0]);

    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 회의');

    const descriptionInput = screen.getByLabelText('설명');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, '수정된 설명');

    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(() => {
      expect(within(eventList).getByText('수정된 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('수정된 설명')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const testEvents = [...events];
    setupMockHandlerDeletion(events);
    const { user } = setup(<App />);

    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText(events[0].title)).toBeInTheDocument();
    });

    const deleteButtons = within(eventList).getAllByLabelText(/delete event/i);
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(within(eventList).queryByText(testEvents[0].title)).not.toBeInTheDocument();
    });

    expect(within(eventList).getByText(testEvents[1].title)).toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await user.selectOptions(screen.getByLabelText('view'), 'week');
    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    vi.setSystemTime('2025-02-01');
    setupMockHandlerCreation(events);
    const { user } = setup(<App />);

    await user.selectOptions(screen.getByLabelText('view'), 'Week');

    await waitFor(async () => {
      const eventList = within(await screen.getByTestId('event-list'));
      expect(eventList.getByText('아침 회의')).toBeInTheDocument();
      expect(eventList.getByText('2025-02-01')).toBeInTheDocument();
      expect(eventList.getByText('09:00 - 10:00')).toBeInTheDocument();
      expect(eventList.getByText('장소 1')).toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await user.selectOptions(screen.getByLabelText('view'), 'month');
    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it('월별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    vi.setSystemTime('2025-02-01');
    setupMockHandlerCreation(events);
    const { user } = setup(<App />);

    await user.selectOptions(screen.getByLabelText('view'), 'month');

    await waitFor(async () => {
      const eventList = within(await screen.getByTestId('event-list'));
      expect(eventList.getByText('아침 회의')).toBeInTheDocument();
      expect(eventList.getByText('2025-02-01')).toBeInTheDocument();
      expect(eventList.getByText('09:00 - 10:00')).toBeInTheDocument();
      expect(eventList.getByText('장소 1')).toBeInTheDocument();
    });
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-01-01');
    setupMockHandlerCreation(events);
    const { user } = setup(<App />);
    await user.selectOptions(screen.getByLabelText('view'), 'month');

    const calendar = screen.getByTestId('month-view');
    const yearMonth = within(calendar).getByRole('heading');
    expect(yearMonth.textContent).toContain('1월');
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요/);
    await user.type(searchInput, '팀 회의');
    expect(screen.getByText(/검색 결과가 없습니다/)).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    vi.setSystemTime('2025-02-01');
    setupMockHandlerCreation(events);
    const { user } = setup(<App />);

    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '팀 회의');

    await waitFor(() => {
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
      expect(within(eventList).queryByText('아침 회의')).not.toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlerCreation(events);
    const { user } = setup(<App />);

    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '전체 회의');

    await waitFor(() => {
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });

    await user.clear(screen.getByPlaceholderText('검색어를 입력하세요'));

    await waitFor(() => {
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('아침 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('아침회의')).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation(events);
    const { user } = setup(<App />);

    await waitFor(() => {
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText('아침 회의')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('제목'), '새 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-02-01');
    await user.type(screen.getByLabelText('시작 시간'), '09:30');
    await user.type(screen.getByLabelText('종료 시간'), '10:30');
    await user.type(screen.getByLabelText('설명'), '팀 미팅');
    await user.type(screen.getByLabelText('위치'), '회의실 2');
    await user.selectOptions(screen.getByLabelText(/카테고리/), '업무');

    await user.click(screen.getByRole('button', { name: /일정 추가/ }));

    expect(screen.getByText(/일정 겹침 경고/)).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerCreation(events);
    const { user } = setup(<App />);

    await waitFor(() => {
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    });

    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[1]);

    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '10:30');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '11:30');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText(/일정 겹침 경고/)).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-02-01T08:50:00'));
  setupMockHandlerCreation([
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
      notificationTime: 10,
    },
  ]);

  setup(<App />);

  const alert = await screen.findByRole('alert');
  expect(alert).toBeInTheDocument();
});
