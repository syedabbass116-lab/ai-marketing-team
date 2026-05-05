import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed tracking-wide';

  const variants = {
    /** Solid white → black on hover */
    primary:
      'bg-white text-black border border-white hover:bg-zinc-100 active:bg-zinc-200',
    /** Outlined white */
    secondary:
      'bg-transparent text-white border border-[#3a3a3a] hover:border-white hover:bg-white/5',
    /** Borderless muted */
    ghost:
      'bg-transparent text-[#888] border border-transparent hover:text-white hover:bg-white/8',
    /** Danger — keep red but desaturated */
    danger:
      'bg-white text-red-600 border border-[#3a3a3a] hover:bg-red-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-sm',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
