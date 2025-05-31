interface Props {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export default function Input({
  placeholder,
  value,
  onChange,
  icon,
  iconPosition = 'left',
  className,
}: Props) {
  return (
    <div className={`${className} relative`}>
      <input
        type='text'
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className='w-full pl-8 pr-4 py-2 h-full bg-white/10 border border-white/20 rounded-lg outline-none focus:border-white/50 transition-colors'
      ></input>
      {icon && (
        <span
          className={`absolute top-1/2 -translate-y-1/2 ${
            iconPosition === 'left' ? 'left-2' : 'right-2'
          }`}
        >
          {icon}
        </span>
      )}
    </div>
  );
}
