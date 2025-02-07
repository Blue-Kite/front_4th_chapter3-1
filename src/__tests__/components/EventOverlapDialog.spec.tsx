import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';

import { EventOverlapDialog } from '../../components/dialog/EventOverlapDialog';
import { Event } from '../../types';

const mockOverlappingEvents: Event[] = [
  {
    id: '1',
    title: '회의',
    date: '2024-02-07',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 회의',
    location: '회의실 a',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 0,
      endDate: '',
    },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '미팅',
    date: '2024-02-07',
    startTime: '10:30',
    endTime: '11:00',
    description: '주간 회의',
    location: '회의실 b',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 0,
      endDate: '',
    },
    notificationTime: 0,
  },
];

describe('EventOverlapDialog', () => {
  it('다이얼로그가 열렸을 때 겹치는 일정을 표시한다.', () => {
    const handleClose = vi.fn();
    const handleContinue = vi.fn();
    const cancelRef = createRef<HTMLButtonElement>();

    render(
      <EventOverlapDialog
        isOpen={true}
        onClose={handleClose}
        overlappingEvents={mockOverlappingEvents}
        cancelRef={cancelRef}
        onContinue={handleContinue}
      />
    );

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('회의 (2024-02-07 10:00-11:00)')).toBeInTheDocument();
    expect(screen.getByText('미팅 (2024-02-07 10:30-11:00)')).toBeInTheDocument();
  });

  it('취소 버튼 클릭시 onClose가 호출된다.', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const handleContinue = vi.fn();
    const cancelRef = createRef<HTMLButtonElement>();

    render(
      <EventOverlapDialog
        isOpen={true}
        onClose={handleClose}
        overlappingEvents={mockOverlappingEvents}
        cancelRef={cancelRef}
        onContinue={handleContinue}
      />
    );

    const cancelButton = screen.getByText('취소');
    await user.click(cancelButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('계속 진행 버튼 클릭시 onContinue가 호출된다.', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const handleContinue = vi.fn();
    const cancelRef = createRef<HTMLButtonElement>();

    render(
      <EventOverlapDialog
        isOpen={true}
        onClose={handleClose}
        overlappingEvents={mockOverlappingEvents}
        cancelRef={cancelRef}
        onContinue={handleContinue}
      />
    );

    const continueButton = screen.getByText('계속 진행');
    await user.click(continueButton);

    expect(handleContinue).toHaveBeenCalledTimes(1);
  });

  it('다이얼로그가 닫혔을 때는 내용이 보이지 않는다.', () => {
    const handleClose = vi.fn();
    const handleContinue = vi.fn();
    const cancelRef = createRef<HTMLButtonElement>();

    render(
      <EventOverlapDialog
        isOpen={false}
        onClose={handleClose}
        overlappingEvents={mockOverlappingEvents}
        cancelRef={cancelRef}
        onContinue={handleContinue}
      />
    );

    expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
    expect(screen.queryByText('계속 진행하시겠습니까?')).not.toBeInTheDocument();
  });
});
