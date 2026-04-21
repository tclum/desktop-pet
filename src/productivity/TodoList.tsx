import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from './types';
import {
  getTasks,
  createTask,
  completeTask,
  deleteTask,
  updateTask,
  reorderTasks,
} from '../lib/tauri';

interface Props {
  onPointsEarned: (points: number) => void;
  onEvolution: () => void;
}

export default function TodoList({ onPointsEarned, onEvolution }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Drag activation needs a small movement threshold so a plain click on the
  // title still falls through to edit mode rather than starting a drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const reloadTasks = useCallback(() => {
    getTasks()
      .then(setTasks)
      .catch((err: unknown) => {
        console.error('Failed to load tasks:', err);
      });
  }, []);

  useEffect(() => {
    reloadTasks();
  }, [reloadTasks]);

  // One-shot timer that fires at local midnight to drop yesterday's completed
  // tasks from the "completed today" view. Re-arms itself after each fire so
  // long-running app sessions keep the view fresh.
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const scheduleNextMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        1,
      );
      const msUntil = nextMidnight.getTime() - now.getTime();
      timerId = setTimeout(() => {
        reloadTasks();
        scheduleNextMidnight();
      }, msUntil);
    };

    scheduleNextMidnight();
    return () => {
      if (timerId !== null) clearTimeout(timerId);
    };
  }, [reloadTasks]);

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
        })
        .catch((err: unknown) => {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === taskId ? { ...t, completed_at: null } : t,
            ),
          );
          console.error('Failed to complete task:', err);
        });
    },
    [onPointsEarned, onEvolution],
  );

  const handleDelete = useCallback((taskId: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    deleteTask(taskId).catch((err: unknown) => {
      console.error('Failed to delete task:', err);
    });
  }, []);

  const startEditing = useCallback((task: Task) => {
    setEditingTaskId(task.id);
    setEditDraft(task.title);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingTaskId(null);
    setEditDraft('');
  }, []);

  const commitEditing = useCallback(() => {
    if (editingTaskId === null) return;
    const taskId = editingTaskId;
    const trimmed = editDraft.trim();
    const previous = tasks.find((t) => t.id === taskId);
    // Empty-after-trim reverts silently — spec: "not allowed, revert to previous".
    if (!trimmed || !previous || trimmed === previous.title) {
      cancelEditing();
      return;
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, title: trimmed } : t)),
    );
    cancelEditing();
    updateTask(taskId, trimmed).catch((err: unknown) => {
      // Roll back on failure so the UI doesn't lie about persisted state.
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, title: previous.title } : t)),
      );
      console.error('Failed to update task:', err);
    });
  }, [editingTaskId, editDraft, tasks, cancelEditing]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEditing();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEditing();
      }
    },
    [commitEditing, cancelEditing],
  );

  const { activeTasks, completedTodayTasks } = useMemo(() => {
    const active: Task[] = [];
    const completed: Task[] = [];
    for (const t of tasks) {
      if (t.completed_at === null) active.push(t);
      else completed.push(t);
    }
    active.sort(
      (a, b) => a.display_order - b.display_order || a.id - b.id,
    );
    completed.sort((a, b) => {
      // Most recently completed first — more useful for "what did I just do".
      const aTime = a.completed_at ?? '';
      const bTime = b.completed_at ?? '';
      return bTime.localeCompare(aTime);
    });
    return { activeTasks: active, completedTodayTasks: completed };
  }, [tasks]);

  const activeIds = useMemo(() => activeTasks.map((t) => t.id), [activeTasks]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = activeIds.indexOf(active.id as number);
      const newIndex = activeIds.indexOf(over.id as number);
      if (oldIndex < 0 || newIndex < 0) return;

      const reordered = arrayMove(activeTasks, oldIndex, newIndex);
      const previousOrders = new Map(
        activeTasks.map((t) => [t.id, t.display_order]),
      );

      setTasks((prev) => {
        const orderById = new Map<number, number>();
        reordered.forEach((t, i) => orderById.set(t.id, i));
        return prev.map((t) => {
          const next = orderById.get(t.id);
          return next === undefined ? t : { ...t, display_order: next };
        });
      });

      const orderedIds = reordered.map((t) => t.id);
      reorderTasks(orderedIds).catch((err: unknown) => {
        // Roll back to previous orders if the backend write failed.
        setTasks((prev) =>
          prev.map((t) => {
            const prior = previousOrders.get(t.id);
            return prior === undefined ? t : { ...t, display_order: prior };
          }),
        );
        console.error('Failed to reorder tasks:', err);
      });
    },
    [activeTasks, activeIds],
  );

  const hasAnyTasks =
    activeTasks.length > 0 || completedTodayTasks.length > 0;

  return (
    <div className="todo-list">
      <div className="todo-scroll">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={activeIds}
            strategy={verticalListSortingStrategy}
          >
            <ul className="todo-items" role="list">
              {activeTasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  isEditing={editingTaskId === task.id}
                  editDraft={editDraft}
                  onEditDraftChange={setEditDraft}
                  onStartEdit={() => startEditing(task)}
                  onEditKeyDown={handleEditKeyDown}
                  onEditCommit={commitEditing}
                  onComplete={() => handleComplete(task.id)}
                  onDelete={() => handleDelete(task.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        {!hasAnyTasks && <p className="todo-empty">nothing yet</p>}

        {completedTodayTasks.length > 0 && (
          <div className="todo-completed-section">
            <h4 className="todo-completed-header">completed today</h4>
            <ul className="todo-items todo-items--completed" role="list">
              {completedTodayTasks.map((task) => (
                <li key={task.id} className="todo-item todo-item--done-static">
                  <span className="todo-title">{task.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
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

interface SortableTaskItemProps {
  task: Task;
  isEditing: boolean;
  editDraft: string;
  onEditDraftChange: (value: string) => void;
  onStartEdit: () => void;
  onEditKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onEditCommit: () => void;
  onComplete: () => void;
  onDelete: () => void;
}

function SortableTaskItem({
  task,
  isEditing,
  editDraft,
  onEditDraftChange,
  onStartEdit,
  onEditKeyDown,
  onEditCommit,
  onComplete,
  onDelete,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Dragged row sits above the others; completed-today section stays quiet below.
    zIndex: isDragging ? 2 : undefined,
    opacity: isDragging ? 0.85 : undefined,
  };

  // Drag listeners go on the row so the whole item is a drag target, but we
  // strip them during edit mode so pointer events reach the input unimpeded.
  const dragListeners = isEditing ? {} : listeners;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={[
        'todo-item',
        isDragging ? 'todo-item--dragging' : '',
        isEditing ? 'todo-item--editing' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...attributes}
      {...dragListeners}
    >
      <button
        className="todo-checkbox"
        role="checkbox"
        aria-checked={false}
        aria-label={`Mark "${task.title}" complete`}
        onClick={(e) => {
          e.stopPropagation();
          onComplete();
        }}
      />
      {isEditing ? (
        <input
          className="todo-edit-input"
          type="text"
          value={editDraft}
          autoFocus
          onChange={(e) => onEditDraftChange(e.target.value)}
          onKeyDown={onEditKeyDown}
          onBlur={onEditCommit}
          onPointerDown={(e) => e.stopPropagation()}
          maxLength={200}
          aria-label={`Edit task "${task.title}"`}
        />
      ) : (
        <span
          className="todo-title todo-title--editable"
          role="button"
          tabIndex={0}
          aria-label={`Edit task "${task.title}"`}
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit();
          }}
          onKeyDown={(e) => {
            // Keyboard parity with the pointer click — Enter or Space
            // activates the inline edit. stopPropagation prevents the
            // dnd-kit keyboard sensor from interpreting Space as drag start.
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onStartEdit();
            }
          }}
        >
          {task.title}
        </span>
      )}
      <button
        className="todo-delete"
        aria-label={`Delete "${task.title}"`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        ×
      </button>
    </li>
  );
}
