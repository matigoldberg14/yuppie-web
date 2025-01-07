// src/components/ui/use-toasts.ts
import * as React from 'react';

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
};

let count = 0;

function generateId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
};

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = ({
    title,
    description,
    variant,
    duration = 5000,
  }: ToastProps) => {
    const id = generateId();

    setToasts((prevToasts) => {
      const newToast: Toast = {
        id,
        title,
        description,
        variant,
        duration,
      };

      return [...prevToasts, newToast].slice(-TOAST_LIMIT);
    });

    const timeout = setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, duration);

    toastTimeouts.set(id, timeout);

    return id;
  };

  const dismiss = (toastId?: string) => {
    setToasts((prevToasts) =>
      prevToasts.filter((toast) => {
        if (toast.id === toastId || toastId === undefined) {
          const timeout = toastTimeouts.get(toast.id);
          if (timeout) clearTimeout(timeout);
          toastTimeouts.delete(toast.id);
          return false;
        }
        return true;
      })
    );
  };

  return {
    toast,
    dismiss,
    toasts,
  };
}

export type { Toast };
