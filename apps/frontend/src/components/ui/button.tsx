import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation';
    
    const variants = {
      primary: 'text-white shadow-sm',
      secondary: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 focus:ring-secondary-500',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      ghost: 'text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-3 py-1.5 text-sm',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        style={variant === 'primary' ? { backgroundColor: '#059669' } : undefined}
        onMouseEnter={variant === 'primary' ? (e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.backgroundColor = '#047857';
          }
        } : undefined}
        onMouseLeave={variant === 'primary' ? (e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.backgroundColor = '#059669';
          }
        } : undefined}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="spinner h-4 w-4" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
