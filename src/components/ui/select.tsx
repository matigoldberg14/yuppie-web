// src/components/ui/select.tsx
import * as React from 'react';

interface SelectProps {
  children: React.ReactNode;
  onValueChange: (value: string) => void;
  className?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}>({
  value: '',
  onValueChange: () => {},
  isOpen: false,
  setIsOpen: () => {},
});

export function Select({
  children,
  onValueChange,
  className = '',
}: SelectProps) {
  const [value, setValue] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    onValueChange(newValue);
    setIsOpen(false);
  };

  return (
    <SelectContext.Provider
      value={{ value, onValueChange: handleValueChange, isOpen, setIsOpen }}
    >
      <div className={`relative ${className}`}>{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  children,
  className = '',
}: SelectTriggerProps) {
  const context = React.useContext(SelectContext);

  return (
    <button
      className={`flex h-10 w-full items-center justify-between rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={() => context.setIsOpen(!context.isOpen)}
    >
      {children}
    </button>
  );
}

export function SelectContent({
  children,
  className = '',
}: SelectContentProps) {
  const context = React.useContext(SelectContext);

  if (!context.isOpen) return null;

  return (
    <div
      className={`absolute z-50 w-full rounded-md border border-white/10 bg-black/90 shadow-lg mt-1 ${className}`}
    >
      {children}
    </div>
  );
}

export function SelectItem({
  value,
  children,
  className = '',
}: SelectItemProps) {
  const context = React.useContext(SelectContext);

  return (
    <button
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-3 text-sm outline-none text-white hover:bg-white/10 ${className}`}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  );
}

export function SelectValue({
  placeholder = '',
  className = '',
}: SelectValueProps) {
  const context = React.useContext(SelectContext);

  return (
    <span className={`block truncate ${className}`}>
      {context.value || placeholder}
    </span>
  );
}
