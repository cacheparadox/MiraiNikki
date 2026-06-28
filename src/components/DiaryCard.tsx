import React from 'react';
import { BookOpen, Lock, Unlock, Eye, Archive } from 'lucide-react';
import { JournalStatus } from '../types';
import clsx from 'clsx';

interface DiaryCardProps {
  status: JournalStatus;
  date?: string;
  onAction?: () => void;
  actionLabel?: string;
  isAnimating?: boolean;
  className?: string;
}

export const DiaryCard: React.FC<DiaryCardProps> = ({
  status,
  date,
  onAction,
  actionLabel,
  isAnimating = false,
  className,
}) => {
  const dateStr = date
    ? new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(date))
    : '';

  return (
    <div className={clsx('flex flex-col items-center', className)}>
      {/* The diary book */}
      <div
        className={clsx(
          'relative w-full max-w-[320px] aspect-[3/4] rounded-lg overflow-hidden transition-all duration-500',
          isAnimating && 'animate-diary-open',
          status === JournalStatus.Sealed && 'animate-float',
        )}
        style={{ perspective: '800px' }}
      >
        {/* Book cover */}
        <div
          className={clsx(
            'absolute inset-0 rounded-lg border-2 transition-all duration-500',
            'flex flex-col items-center justify-center gap-4 p-8',
            {
              // Draft: Lighter, inviting
              'bg-gradient-to-br from-[#2A2D3A] to-[#1E2130] border-[var(--color-divider)]':
                status === JournalStatus.Draft,
              // Sealed: Rich, mysterious
              'bg-gradient-to-br from-[#1A1D2E] to-[#0D0F1A] border-[var(--color-gold)]/30':
                status === JournalStatus.Sealed || status === JournalStatus.PendingCompilation,
              // Ready: Warm glow
              'bg-gradient-to-br from-[#1F2234] to-[#141728] border-[var(--color-gold)]/60 shadow-[0_0_40px_rgba(214,177,94,0.15)]':
                status === JournalStatus.Ready,
              // Opened: Paper-like
              'bg-gradient-to-br from-[var(--color-paper)] to-[#E8DFD0] border-[var(--color-gold)]/20':
                status === JournalStatus.Opened,
              // Archived: Muted
              'bg-gradient-to-br from-[#1C1F2E] to-[#14162A] border-[var(--color-divider)] opacity-80':
                status === JournalStatus.Archived,
            }
          )}
        >
          {/* Book spine effect */}
          <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-gradient-to-r from-black/30 to-transparent" />
          <div className="absolute left-[6px] top-0 bottom-0 w-[2px] bg-[var(--color-gold)]/20" />

          {/* Cover texture lines */}
          <div className="absolute inset-0 opacity-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-8 right-8 h-px bg-current"
                style={{ top: `${20 + i * 5}%` }}
              />
            ))}
          </div>

          {/* Status icon */}
          <div className={clsx(
            'w-16 h-16 rounded-full flex items-center justify-center mb-2',
            {
              'bg-[var(--color-muted)]/10': status === JournalStatus.Draft || status === JournalStatus.Archived,
              'bg-[var(--color-gold)]/10': status === JournalStatus.Sealed || status === JournalStatus.PendingCompilation,
              'bg-[var(--color-gold)]/20': status === JournalStatus.Ready,
              'bg-[var(--color-gold)]/10 text-[#1C1C1C]': status === JournalStatus.Opened,
            }
          )}>
            {status === JournalStatus.Draft && <BookOpen size={28} className="text-[var(--color-muted)]" />}
            {(status === JournalStatus.Sealed || status === JournalStatus.PendingCompilation) && <Lock size={28} className="text-[var(--color-gold)]" />}
            {status === JournalStatus.Ready && <Unlock size={28} className="text-[var(--color-gold)]" />}
            {status === JournalStatus.Opened && <Eye size={28} className="text-[#6B5C3E]" />}
            {status === JournalStatus.Archived && <Archive size={28} className="text-[var(--color-muted)]" />}
          </div>

          {/* Title */}
          <h3 className={clsx(
            'font-journal text-2xl font-semibold text-center',
            status === JournalStatus.Opened ? 'text-[#3A3425]' : 'text-[var(--color-text-primary)]'
          )}>
            Mirai Nikki
          </h3>

          {dateStr && (
            <p className={clsx(
              'font-journal text-sm mt-1',
              status === JournalStatus.Opened ? 'text-[#6B5C3E]' : 'text-[var(--color-muted)]'
            )}>
              {dateStr}
            </p>
          )}

          {/* Wax seal for sealed state */}
          {(status === JournalStatus.Sealed || status === JournalStatus.PendingCompilation) && (
            <div className="absolute bottom-6 right-6">
              <div className={clsx(
                'w-12 h-12 rounded-full bg-gradient-to-br from-[#D6B15E] to-[#B8942E]',
                'flex items-center justify-center shadow-lg',
                isAnimating && 'animate-seal-stamp'
              )}>
                <span className="font-journal text-lg font-bold text-[#1A1D2E]">未</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action button */}
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="mt-6 px-8 py-3 bg-[var(--color-gold)] text-[var(--color-bg)] rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg animate-slide-up"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
