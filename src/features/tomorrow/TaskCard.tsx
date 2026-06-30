import React, { useState, useRef, useEffect } from 'react';
import type { Task } from '../../types';
import { Check, Clock, Tag, ChevronUp, ChevronDown, Pencil } from 'lucide-react';
import clsx from 'clsx';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  onMoveUp?: (() => void) | undefined;
  onMoveDown?: (() => void) | undefined;
  onEdit?: ((id: string, newTitle: string) => void) | undefined;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onHoverStart, onHoverEnd, onMoveUp, onMoveDown, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditSubmit = () => {
    if (editTitle.trim() && editTitle.trim() !== task.title && onEdit) {
      onEdit(task.id, editTitle.trim());
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEditSubmit();
    if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

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
        {isEditing ? (
          <input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={handleKeyDown}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-gold)] text-[var(--color-text-primary)] rounded px-2 py-1 mb-1 outline-none font-medium"
          />
        ) : (
          <h4 className={clsx(
            'text-base font-medium mb-1.5 transition-all duration-300',
            task.completed ? 'line-through text-[var(--color-muted)]' : 'text-[var(--color-text-primary)]'
          )}>
            {task.title}
          </h4>
        )}
        
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
      
      {(!task.completed && (onMoveUp || onMoveDown || onEdit)) && (
        <div className="flex flex-col items-center gap-1 opacity-30 hover:opacity-100 focus-within:opacity-100 transition-opacity ml-2">
          {onMoveUp && (
            <button 
              onClick={onMoveUp} 
              className="p-1 text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors"
            >
              <ChevronUp size={16} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors"
            >
              <Pencil size={12} />
            </button>
          )}
          {onMoveDown && (
            <button 
              onClick={onMoveDown} 
              className="p-1 text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors"
            >
              <ChevronDown size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
