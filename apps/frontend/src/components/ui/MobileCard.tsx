import React from 'react';
import { MoreVertical } from 'lucide-react';

interface MobileCardField {
  label: string;
  value: string | number | React.ReactNode;
  highlight?: boolean;
  badge?: boolean;
}

interface MobileCardAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
}

interface MobileCardProps {
  fields: MobileCardField[];
  actions?: MobileCardAction[];
  onCardClick?: () => void;
}

export function MobileCard({ fields, actions, onCardClick }: MobileCardProps) {
  const [showActions, setShowActions] = React.useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div onClick={onCardClick} className={onCardClick ? 'cursor-pointer' : ''}>
        {/* Card Content */}
        <div className="space-y-2.5">
          {fields.map((field, index) => (
            <div key={index} className={field.highlight ? 'mb-3' : ''}>
              <div className="flex justify-between items-start gap-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {field.label}
                </span>
                {field.badge ? (
                  <div className="text-sm font-medium">{field.value}</div>
                ) : field.highlight ? (
                  <div className="text-base font-semibold text-gray-900">{field.value}</div>
                ) : (
                  <div className="text-sm text-gray-900 text-right flex-1">{field.value}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical size={16} />
              <span>Aksi</span>
            </button>

            {/* Actions Dropdown */}
            {showActions && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />
                
                {/* Actions Menu */}
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        action.onClick();
                        setShowActions(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                        action.variant === 'danger'
                          ? 'text-red-600 hover:bg-red-50'
                          : action.variant === 'primary'
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-gray-700 hover:bg-gray-50'
                      } ${index < actions.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface MobileCardsListProps {
  title?: string;
  count?: number;
  cards: Array<{
    id: string | number;
    fields: MobileCardField[];
    actions?: MobileCardAction[];
    onCardClick?: () => void;
  }>;
  emptyMessage?: string;
}

export function MobileCardsList({ title, count, cards, emptyMessage = 'Tidak ada data' }: MobileCardsListProps) {
  if (cards.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      {(title || count !== undefined) && (
        <div className="flex items-center justify-between px-1 mb-2">
          {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
          {count !== undefined && (
            <span className="text-xs font-medium text-gray-500">
              {count} {count === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
      )}

      {/* Cards */}
      {cards.map((card) => (
        <MobileCard
          key={card.id}
          fields={card.fields}
          actions={card.actions}
          onCardClick={card.onCardClick}
        />
      ))}
    </div>
  );
}

// Utility function to format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

// Utility function to format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Status badge component
export function StatusBadge({ status, variant }: { status: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' }) {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {status}
    </span>
  );
}
