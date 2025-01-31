// src/components/ui/use-toast.ts
import { toast as sonnerToast } from 'sonner';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
};

export function useToast() {
  const toast = ({
    title,
    description,
    variant = 'default',
    duration = 5000,
  }: ToastProps) => {
    if (variant === 'destructive') {
      sonnerToast.error(title, {
        description,
        duration,
      });
    } else {
      sonnerToast.success(title, {
        description,
        duration,
      });
    }
  };

  return {
    toast,
  };
}

export { type ToastProps };
