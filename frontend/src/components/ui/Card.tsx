import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`relative bg-[rgba(15,15,15,0.8)] border border-white/10 rounded-2xl p-6 shadow-2xl ${
        hover
          ? 'hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
