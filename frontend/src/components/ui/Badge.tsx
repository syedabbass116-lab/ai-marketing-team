import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'default';
  className?: string;
}

/**
 * All platform variants rendered as a uniform B&W monochrome badge.
 * The platform name is still shown so context isn't lost.
 */
export default function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium
        bg-white/5 text-white/70 border border-white/10 tracking-widest uppercase ${className}`}
    >
      {children}
    </span>
  );
}
