import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-black border border-[#2a2a2a] rounded-lg px-4 py-2.5
          text-white placeholder-[#444] text-sm
          focus:outline-none focus:border-white/40 focus:ring-0
          transition-colors duration-150 ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-white/50">{error}</p>}
    </div>
  );
}
