import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'default';
  className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    linkedin: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
    twitter: 'bg-sky-600/20 text-sky-400 border-sky-600/30',
    instagram: 'bg-pink-600/20 text-pink-400 border-pink-600/30',
    facebook: 'bg-blue-700/20 text-blue-400 border-blue-700/30',
    tiktok: 'bg-purple-600/20 text-purple-400 border-purple-600/30',
    default: 'bg-gray-800 text-gray-300 border-gray-700'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
