import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`w-full bg-black border border-[#2a2a2a] rounded-lg px-4 py-2.5
          text-white placeholder-[#444] text-sm
          focus:outline-none focus:border-white/40 focus:ring-0
          transition-colors duration-150 resize-none ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-white/50">{error}</p>}
    </div>
  );
}
