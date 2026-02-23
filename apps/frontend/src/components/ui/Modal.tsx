import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  mobileFullScreen?: boolean;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  size = 'md',
  mobileFullScreen = true,
  closeOnBackdrop = true,
  showCloseButton = true,
  headerClassName,
  contentClassName,
  footerClassName,
}: ModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'md:max-w-sm',
    md: 'md:max-w-md',
    lg: 'md:max-w-lg',
    xl: 'md:max-w-xl',
    full: 'md:max-w-7xl',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          'bg-white flex flex-col transition-all duration-300',
          // Mobile: Full screen or bottom sheet
          mobileFullScreen
            ? 'w-full h-full md:h-auto md:rounded-xl md:shadow-2xl'
            : 'w-full max-h-[90vh] rounded-t-2xl md:rounded-xl md:shadow-2xl',
          // Desktop: Centered modal with max-width
          sizeClasses[size],
          'md:w-full md:max-h-[90vh]',
          // Animation
          mobileFullScreen
            ? 'animate-in slide-in-from-bottom md:zoom-in-95 duration-300'
            : 'animate-in slide-in-from-bottom-4 zoom-in-95 duration-300'
        )}
      >
        {/* Header */}
        {(title || icon || showCloseButton) && (
          <div
            className={cn(
              'flex items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-gray-200 flex-shrink-0',
              headerClassName
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {icon && <div className="flex-shrink-0">{icon}</div>}
              {title && (
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
                  {title}
                </h2>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            'flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6',
            contentClassName
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              'flex-shrink-0 px-4 md:px-6 py-4 border-t border-gray-200 bg-gray-50',
              footerClassName
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Modal Footer Helper Component
interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
}

export function ModalFooter({ children, className, reverse = false }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'flex gap-3',
        reverse ? 'flex-row-reverse' : 'flex-row',
        'justify-end',
        className
      )}
    >
      {children}
    </div>
  );
}

// Modal Body Helper Component
interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}
