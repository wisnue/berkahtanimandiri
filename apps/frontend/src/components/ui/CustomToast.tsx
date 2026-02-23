import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Toast as HotToast } from 'react-hot-toast';

interface ToastProps {
  t: HotToast;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export const CustomToast: React.FC<ToastProps> = ({ t, message, type, onClose }) => {
  const config = {
    success: {
      icon: CheckCircle2,
      bgGradient: 'from-emerald-500 to-emerald-600',
      iconColor: 'text-white',
      borderColor: 'border-emerald-400',
    },
    error: {
      icon: XCircle,
      bgGradient: 'from-red-500 to-red-600',
      iconColor: 'text-white',
      borderColor: 'border-red-400',
    },
    warning: {
      icon: AlertTriangle,
      bgGradient: 'from-amber-500 to-amber-600',
      iconColor: 'text-white',
      borderColor: 'border-amber-400',
    },
    info: {
      icon: Info,
      bgGradient: 'from-blue-500 to-blue-600',
      iconColor: 'text-white',
      borderColor: 'border-blue-400',
    },
  };

  const { icon: Icon, bgGradient, iconColor, borderColor } = config[type];

  return (
    <div
      className={`
        ${t.visible ? 'animate-enter' : 'animate-leave'}
        max-w-md w-full bg-gradient-to-r ${bgGradient} shadow-lg rounded-lg pointer-events-auto 
        flex items-start ring-1 ring-black ring-opacity-5 border-l-4 ${borderColor}
      `}
    >
      <div className="flex-1 w-0 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex border-l border-white/20">
        <button
          onClick={onClose}
          className="w-full border border-transparent rounded-none rounded-r-lg p-3 flex items-center justify-center text-sm font-medium text-white hover:bg-white/10 focus:outline-none transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-lg overflow-hidden">
        <div 
          className="h-full bg-white/50 animate-progress"
          style={{
            animation: `progress ${type === 'error' ? '5s' : '3s'} linear forwards`
          }}
        />
      </div>
    </div>
  );
};
