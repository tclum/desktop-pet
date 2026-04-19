import { useState, useEffect, useRef, useCallback } from 'react';
import type { Task } from './types';
import { getTasks, createTask, completeTask, deleteTask } from '../lib/tauri';

interface Props {
  onPointsEarned: (points: number) => void;
  onEvolution: () => void;
}

export default function TodoList({ onPointsEarned, onEvolution }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState('');
  // Track which task ids are in the process of being removed from the list
  // after completion, so we can animate them out before removing from state.
  const [fadingOut, setFadingOut] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch((err: unknown) => {
        console.error('Failed to load tasks:', err);
      });
  }, []);

  const handleSubmit = useCallback(() => {
    const title = draft.trim();
    if (!title) return;
    setDraft('');
    createTask(title)
      .then((task) => setTasks((prev) => [...prev, task]))
      .catch((err: unknown) => {
        console.error('Failed to create task:', err);
      });
  }, [draft]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSubmit();
    },
    [handleSubmit],
  );

  const handleComplete = useCallback(
    (taskId: number) => {
      // Optimistically mark complete in UI immediately.
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, completed_at: new Date().toISOString() }
            : t,
        ),
      );

      completeTask(taskId)
        .then(({ points_awarded, evolved }) => {
          if (points_awarded > 0) onPointsEarned(points_awarded);
          if (evolved) onEvolution();
          // Begin fade-out, then remove from list after animation.
          setFadingOut((prev) => new Set(prev).add(taskId));
          setTimeout(() => {
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
            setFadingOut((prev) => {
              const next = new Set(prev);
              next.delete(taskId);
              return next;
            });
          }, 500);
        })
        .catch((err: unknown) => {
          // Roll back optimistic update on failure.
          setTasks((prev) =>
            prev.map((t) =>
              t.id === taskId ? { ...t, completed_at: null } : t,
            ),
          );
          console.error('Failed to complete task:', err);
        });
    },
    [onPointsEarned],
  );

  const handleDelete = useCallback((taskId: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    deleteTask(taskId).catch((err: unknown) => {
      console.error('Failed to delete task:', err);
    });
  }, []);

  const activeTasks = tasks.filter((t) => t.completed_at === null);
  const completedTasks = tasks.filter((t) => t.completed_at !== null);
  const visibleTasks = [...activeTasks, ...completedTasks];

  return (
    <div className="todo-list">
      <ul className="todo-items" role="list">
        {visibleTasks.map((task) => (
          <li
            key={task.id}
            className={[
              'todo-item',
              task.completed_at !== null ? 'todo-item--done' : '',
              fadingOut.has(task.id) ? 'todo-item--fading' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <button
              className="todo-checkbox"
              role="checkbox"
              aria-checked={task.completed_at !== null}
              aria-label={`Mark "${task.title}" complete`}
              onClick={() =>
                task.completed_at === null && handleComplete(task.id)
              }
              disabled={task.completed_at !== null}
            />
            <span className="todo-title">{task.title}</span>
            <button
              className="todo-delete"
              aria-label={`Delete "${task.title}"`}
              onClick={() => handleDelete(task.id)}
            >
              ×
            </button>
          </li>
        ))}
        {visibleTasks.length === 0 && (
          <li className="todo-empty">nothing yet</li>
        )}
      </ul>
      <div className="todo-input-row">
        <input
          ref={inputRef}
          className="todo-input"
          type="text"
          placeholder="add a task…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={200}
          aria-label="New task title"
        />
      </div>
    </div>
  );
}
