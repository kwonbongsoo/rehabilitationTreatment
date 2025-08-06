import { NotificationManager } from '../notifications';

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
    update: jest.fn(),
  },
}));

const mockToast = require('react-toastify').toast;

describe('알림 관리자', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('성공 알림 표시', () => {
    it('기본 옵션으로 성공 알림을 표시한다', () => {
      NotificationManager.showSuccess('Success message');

      expect(mockToast.success).toHaveBeenCalledWith(
        'Success message',
        expect.objectContaining({
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }),
      );
    });

    it('사용자 지정 옵션으로 성공 알림을 표시한다', () => {
      const customOptions = { autoClose: 5000, position: 'bottom-left' as const };
      NotificationManager.showSuccess('Success message', customOptions);

      expect(mockToast.success).toHaveBeenCalledWith(
        'Success message',
        expect.objectContaining({
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }),
      );
    });
  });

  describe('에러 알림 표시', () => {
    it('기본 옵션으로 에러 알림을 표시한다', () => {
      NotificationManager.showError('Error message');

      expect(mockToast.error).toHaveBeenCalledWith(
        'Error message',
        expect.objectContaining({
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }),
      );
    });
  });

  describe('경고 알림 표시', () => {
    it('경고 알림을 표시한다', () => {
      NotificationManager.showWarning('Warning message');

      expect(mockToast.warning).toHaveBeenCalledWith('Warning message', expect.any(Object));
    });
  });

  describe('정보 알림 표시', () => {
    it('정보 알림을 표시한다', () => {
      NotificationManager.showInfo('Info message');

      expect(mockToast.info).toHaveBeenCalledWith('Info message', expect.any(Object));
    });
  });

  describe('알림 닫기', () => {
    it('특정 알림을 닫는다', () => {
      const toastId = 'toast-id-123';
      NotificationManager.dismiss(toastId);

      expect(mockToast.dismiss).toHaveBeenCalledWith(toastId);
    });
  });

  describe('모든 알림 닫기', () => {
    it('모든 알림을 닫는다', () => {
      NotificationManager.dismissAll();

      expect(mockToast.dismiss).toHaveBeenCalledWith();
    });
  });
});
