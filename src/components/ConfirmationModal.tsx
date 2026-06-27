import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  body: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  body,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDestructive = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--color-surface)] border border-[var(--color-divider)] rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-slide-up">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-[var(--color-muted)] mb-6 leading-relaxed">{body}</p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 font-medium text-[var(--color-text-primary)] hover:bg-white/5 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 font-medium rounded-lg transition-colors ${
              isDestructive 
                ? 'bg-[var(--color-danger)] text-white hover:opacity-90' 
                : 'bg-[var(--color-gold)] text-[var(--color-bg)] hover:opacity-90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
