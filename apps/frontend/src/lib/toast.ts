import toast from 'react-hot-toast';
import { CustomToast } from '@/components/ui/CustomToast';
import { createElement } from 'react';

/**
 * Enhanced toast notification system with beautiful UI/UX
 * Consistent across the entire application
 */
export const showToast = {
  /**
   * Show success toast (green gradient, 3s duration)
   */
  success: (message: string) => {
    toast.custom(
      (t) =>
        createElement(CustomToast, {
          t,
          message,
          type: 'success',
          onClose: () => toast.dismiss(t.id),
        }),
      {
        duration: 3000,
        position: 'top-right',
      }
    );
  },

  /**
   * Show error toast (red gradient, 5s duration)
   */
  error: (message: string) => {
    toast.custom(
      (t) =>
        createElement(CustomToast, {
          t,
          message,
          type: 'error',
          onClose: () => toast.dismiss(t.id),
        }),
      {
        duration: 5000,
        position: 'top-right',
      }
    );
  },

  /**
   * Show warning toast (amber gradient, 4s duration)
   */
  warning: (message: string) => {
    toast.custom(
      (t) =>
        createElement(CustomToast, {
          t,
          message,
          type: 'warning',
          onClose: () => toast.dismiss(t.id),
        }),
      {
        duration: 4000,
        position: 'top-right',
      }
    );
  },

  /**
   * Show info toast (blue gradient, 3s duration)
   */
  info: (message: string) => {
    toast.custom(
      (t) =>
        createElement(CustomToast, {
          t,
          message,
          type: 'info',
          onClose: () => toast.dismiss(t.id),
        }),
      {
        duration: 3000,
        position: 'top-right',
      }
    );
  },

  /**
   * Show loading toast (returns toast id to dismiss later)
   */
  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6b7280',
        color: 'white',
        fontWeight: 500,
      },
    });
  },

  /**
   * Dismiss specific toast by id
   */
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss();
  },

  /**
   * Show promise toast with auto states
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: (data) => {
          const msg = typeof messages.success === 'function' 
            ? messages.success(data) 
            : messages.success;
          return msg;
        },
        error: (err) => {
          const msg = typeof messages.error === 'function'
            ? messages.error(err)
            : messages.error;
          return msg;
        },
      },
      {
        position: 'top-right',
        success: {
          duration: 3000,
        },
        error: {
          duration: 5000,
        },
      }
    );
  },
};
