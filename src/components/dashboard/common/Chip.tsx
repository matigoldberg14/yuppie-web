interface Props {
  backgroundColor?: string;
  color?: string;
  label: string;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export default function Chip({
  backgroundColor = 'bg-green',
  color = 'text-primary-dark',
  label,
  className,
  icon,
  iconPosition = 'left',
}: Props) {
  return (
    <span
      className={`${className} px-2 py-1 rounded-full flex items-center gap-1 ${backgroundColor} ${color}`}
    >
      {icon && iconPosition === 'left' && icon}
      {label}
      {icon && iconPosition === 'right' && icon}
    </span>
  );
}
