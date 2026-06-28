import React from 'react';
import type { Task } from '../../types';
import { Check, Clock, Tag } from 'lucide-react';
import clsx from 'clsx';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onHoverStart, onHoverEnd }) => {
  return (
    <div
      className={clsx(
        'group flex items-start gap-4 p-4 rounded-xl border transition-all duration-300',
        task.completed 
          ? 'bg-[var(--color-surface)] border-transparent opacity-60 hover:opacity-80' 
          : 'bg-[var(--color-surface)] border-[var(--color-divider)] hover:border-[var(--color-gold)] shadow-sm'
      )}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <button
        onClick={() => onComplete(task.id)}
        className={clsx(
          'flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
          task.completed
            ? 'bg-[var(--color-success)] border-[var(--color-success)] text-[var(--color-bg)] animate-check-fill'
            : 'border-[var(--color-muted)] hover:border-[var(--color-success)]'
        )}
      >
        {task.completed && <Check size={14} strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <h4 className={clsx(
          'text-base font-medium mb-1.5 transition-all duration-300',
          task.completed ? 'line-through text-[var(--color-muted)]' : 'text-[var(--color-text-primary)]'
        )}>
          {task.title}
        </h4>
        
        <div className="flex items-center gap-3 text-xs font-medium text-[var(--color-muted)]">
          <span className="flex items-center gap-1">
            <Tag size={12} />
            {task.category}
          </span>
          {task.estimatedMinutes > 0 && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {task.estimatedMinutes}m
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
