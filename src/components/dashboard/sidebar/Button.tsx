interface Props {
  type?: 'button' | 'submit' | 'reset';
  onClick: () => void;
  isCollapsed?: boolean;
  icon: React.ReactNode;
  text: string;
  className?: string;
}

export default function Button({
  type = 'button',
  onClick,
  isCollapsed,
  icon,
  text,
  className,
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${className} w-full flex items-center justify-start gap-2 px-2 py-4 hover:bg-white/10 rounded-lg transition-all duration-300 ${
        isCollapsed ? 'justify-center' : 'justify-start px-4'
      }`}
    >
      {icon}
      {!isCollapsed && <span className='text-base'>{text}</span>}
    </button>
  );
}
