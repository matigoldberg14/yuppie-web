import React from 'react';

interface Props {
  href: string;
  selected: boolean;
  isCollapsed: boolean;
  icon: React.ReactNode;
  text: string;
}

export default function Anchor({
  href,
  selected,
  isCollapsed,
  icon,
  text,
}: Props) {
  return (
    <a
      href={href}
      className={`w-full flex items-center gap-2 py-4 hover:bg-white/10 rounded-lg transition-all duration-300 ${
        selected ? 'bg-white/10' : ''
      } ${isCollapsed ? 'justify-center' : 'justify-start px-4'}`}
    >
      {icon}
      {!isCollapsed && <span className='text-base leading-none'>{text}</span>}
    </a>
  );
}
