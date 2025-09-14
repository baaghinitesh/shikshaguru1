import React from 'react';
import { cn } from '@/utils';
import type { InputProps } from '@/types';

const Input: React.FC<InputProps> = ({
  label,
  error,
  required = false,
  disabled = false,
  placeholder,
  type = 'text',
  value,
  onChange,
  className,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'input',
          error && 'input-error',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;