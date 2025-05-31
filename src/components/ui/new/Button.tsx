interface Props {
  label: string;
  onClick: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export default function Button({
  label,
  onClick,
  type = 'button',
  icon,
  iconPosition = 'left',
  className,
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${className} px-4 py-2 bg-white/10 gap-2 border border-white/20  hover:bg-white/20 transition-colors rounded-lg flex justify-center items-center`}
    >
      {icon && iconPosition === 'left' && icon}
      {label}
      {icon && iconPosition === 'right' && icon}
    </button>
  );
}
