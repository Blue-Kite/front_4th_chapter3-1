import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Notifications } from '../../components/notification/Notifications';

const mockNotifications = [
  { id: '1', message: '첫 번째 알림' },
  { id: '2', message: '두 번째 알림' },
];

describe('Notifications', () => {
  it('알림 목록을 렌더링한다.', () => {
    const handleClose = vi.fn();

    render(<Notifications notifications={mockNotifications} onClose={handleClose} />);

    expect(screen.getByText('첫 번째 알림')).toBeInTheDocument();
    expect(screen.getByText('두 번째 알림')).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  it('닫기 버튼을 클릭시 알림을 제거한다.', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<Notifications notifications={mockNotifications} onClose={handleClose} />);

    const closeButtons = screen.getAllByRole('button');
    await user.click(closeButtons[0]);

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledWith('1');
  });

  it('알림이 없을 때는 아무것도 렌더링하지 않는다.', () => {
    const handleClose = vi.fn();

    render(<Notifications notifications={[]} onClose={handleClose} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
