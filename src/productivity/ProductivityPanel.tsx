import { useState, useCallback } from 'react';
import TodoList from './TodoList';
import FocusTimer from './FocusTimer';
import type { ReactionKind } from '../pet/PetView';

type Tab = 'tasks' | 'focus';

interface Props {
  onPointsEarned: (points: number, kind: ReactionKind) => void;
  onEvolution: () => void;
}

export default function ProductivityPanel({ onPointsEarned, onEvolution }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('tasks');

  const handleTaskPoints = useCallback(
    (points: number) => onPointsEarned(points, 'task'),
    [onPointsEarned],
  );

  const handleFocusPoints = useCallback(
    (points: number) => onPointsEarned(points, 'focus'),
    [onPointsEarned],
  );

  return (
    <div className="productivity-panel">
      <div className="productivity-tabs" role="tablist">
        <button
          className={`productivity-tab${activeTab === 'tasks' ? ' productivity-tab--active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'tasks'}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
        <button
          className={`productivity-tab${activeTab === 'focus' ? ' productivity-tab--active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'focus'}
          onClick={() => setActiveTab('focus')}
        >
          Focus
        </button>
      </div>

      <div className="productivity-content">
        <div className={activeTab === 'tasks' ? 'tab-pane' : 'tab-pane tab-pane--hidden'} role="tabpanel">
          <TodoList onPointsEarned={handleTaskPoints} onEvolution={onEvolution} />
        </div>
        <div className={activeTab === 'focus' ? 'tab-pane' : 'tab-pane tab-pane--hidden'} role="tabpanel">
          <FocusTimer onPointsEarned={handleFocusPoints} onEvolution={onEvolution} />
        </div>
      </div>
    </div>
  );
}
