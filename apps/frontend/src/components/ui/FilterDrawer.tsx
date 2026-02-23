import React, { useEffect, useRef } from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from './button';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReset?: () => void;
  onApply?: () => void;
  title?: string;
  children: React.ReactNode;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  onReset,
  onApply,
  title = 'Filter',
  children,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        if (isOpen) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-drawer-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-emerald-500 to-emerald-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <h2
              id="filter-drawer-title"
              className="text-lg font-semibold text-white"
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            aria-label="Close filter"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
          {onReset && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                onReset();
                onClose();
              }}
            >
              Reset
            </Button>
          )}
          <Button
            type="button"
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0"
            onClick={() => {
              if (onApply) onApply();
              onClose();
            }}
          >
            Terapkan
          </Button>
        </div>
      </div>
    </>
  );
};

// Helper Components

interface FilterFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}

export const FilterField: React.FC<FilterFieldProps> = ({
  label,
  children,
  required = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
};

interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: FilterSelectOption[];
  placeholder?: string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  options,
  placeholder = 'Pilih...',
  className = '',
  ...props
}) => {
  return (
    <select
      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${className}`}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

interface FilterInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const FilterInput: React.FC<FilterInputProps> = ({
  className = '',
  ...props
}) => {
  return (
    <input
      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${className}`}
      {...props}
    />
  );
};

interface FilterDividerProps {
  label?: string;
}

export const FilterDivider: React.FC<FilterDividerProps> = ({ label }) => {
  if (label) {
    return (
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 border-t border-gray-300" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </span>
        <div className="flex-1 border-t border-gray-300" />
      </div>
    );
  }

  return <div className="border-t border-gray-300 my-4" />;
};
