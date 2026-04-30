import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export default function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
          {label}
        </label>
      )}
      <select
        className={`w-full bg-black border border-[#2a2a2a] rounded-lg px-4 py-2.5
          text-white text-sm
          focus:outline-none focus:border-white/40 focus:ring-0
          transition-colors duration-150 appearance-none cursor-pointer ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-black text-white">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
