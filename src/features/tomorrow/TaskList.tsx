import React from 'react';
import type { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onHoverStart: (sentenceId: string) => void;
  onHoverEnd: () => void;
  onAddTask?: (title: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onComplete, onHoverStart, onHoverEnd, onAddTask }) => {
  const [newTaskTitle, setNewTaskTitle] = React.useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() && onAddTask) {
      onAddTask(newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--color-muted)]">
        No tasks compiled yet.
      </div>
    );
  }

  // Sort: pending first, then completed
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  return (
    <div className="flex flex-col gap-3">
      {sortedTasks.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onComplete={onComplete}
          onHoverStart={() => onHoverStart(task.sentenceId)}
          onHoverEnd={onHoverEnd}
        />
      ))}
      
      {onAddTask && (
        <form onSubmit={handleAddTask} className="flex items-center gap-3 p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-divider)] hover:border-[var(--color-gold)] transition-colors opacity-80 focus-within:opacity-100">
          <button type="submit" disabled={!newTaskTitle.trim()} className="text-[var(--color-gold)] disabled:opacity-50">
            <Plus size={20} />
          </button>
          <input 
            type="text" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a custom task..."
            className="flex-1 bg-transparent outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-muted)]"
          />
        </form>
      )}
    </div>
  );
};
