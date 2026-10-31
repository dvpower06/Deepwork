import { useCallback, useEffect, useState } from 'react';
import './App.css';

const STATS_KEY = 'deepwork-stats';

function App() {
  const [stats, setStats] = useState(() => JSON.parse(localStorage.getItem(STATS_KEY) || '{}'));
  const [showPersonalSpace, setShowPersonalSpace] = useState(false);

  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  const recordFocusSecond = useCallback(() => {
    const today = dateKey(new Date());
    setStats((current) => ({
      ...current,
      [today]: {
        ...current[today],
        focusSeconds: (current[today]?.focusSeconds || 0) + 1,
      },
    }));
  }, []);

  const recordTaskDone = useCallback(() => {
    const today = dateKey(new Date());
    setStats((current) => ({
      ...current,
      [today]: {
        ...current[today],
        tasksDone: (current[today]?.tasksDone || 0) + 1,
      },
    }));
  }, []);

  return (
    <main className="app">
      <header className="app-header">
        <h1 className="title">Deepwork</h1>
        {showPersonalSpace ? (
          <button className="button-secondary" onClick={() => setShowPersonalSpace(false)}>
            Back
          </button>
        ) : (
          <button
            className="profile-button"
            onClick={() => setShowPersonalSpace(true)}
            aria-label="Open personal space"
            title="Personal space"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
          </button>
        )}
      </header>
      <div hidden={showPersonalSpace}>
        <Pomodoro onFocusSecond={recordFocusSecond} />
        <Tasks onTaskDone={recordTaskDone} />
      </div>
      {showPersonalSpace && <PersonalSpace stats={stats} />}
    </main>
  );
}

export default App;

function Pomodoro({ onFocusSecond }) {
  const workDuration = 25 * 60;
  const [secondsLeft, setSecondsLeft] = useState(workDuration);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      onFocusSecond();
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          setIsRunning(false);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, onFocusSecond]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  function resetTimer() {
    setIsRunning(false);
    setSecondsLeft(workDuration);
  }

  return (
    <section className="pomodoro">
      <p className="label">Focus time</p>
      <div className="time">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</div>
      <div className="buttons">
        <button className="button-primary" onClick={() => setIsRunning((running) => !running)}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button className="button-secondary" onClick={resetTimer}>Reset</button>
      </div>
    </section>
  );
}

function Tasks({ onTaskDone }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, createTask] = useState('');

  function addTask() {
    if (!newTask.trim()) return;

    setTasks([...tasks, { text: newTask.trim(), done: false }]);
    createTask('');
  }

  function removeTask(indexToRemove) {
    setTasks(tasks.filter((_, index) => index !== indexToRemove));
  }

  function completeTask(indexToComplete) {
    if (tasks[indexToComplete].done) return;
    onTaskDone();
    setTasks((current) => current.map((task, index) =>
      index === indexToComplete ? { ...task, done: true } : task));
  }

  return (
    <section className="tasks-box">
      <ul className="list">
        {tasks.map((task, index) => (
          <li key={index} className="task-item">
            <span className={task.done ? 'task-text done' : 'task-text'}>{task.text}</span>
            <div className="task-actions">
              {!task.done && (
                <button
                  className="complete-button"
                  onClick={() => completeTask(index)}
                  aria-label={`Mark ${task.text} complete`}
                  title="Mark complete"
                >
                  ✓
                </button>
              )}
              <button
                onClick={() => removeTask(index)}
                className="remove-button"
                aria-label={`Remove ${task.text}`}
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="task-input-row">
        <input
          type="text"
          value={newTask}
          onChange={(e) => createTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addTask();
          }}
          className="input"
          placeholder="Add task"
        />
        <button onClick={addTask} className="button-primary">
          Add
        </button>
      </div>
    </section>
  );
}

function PersonalSpace({ stats }) {
  const [period, setPeriod] = useState('week');
  const buckets = getBuckets(period);
  const values = buckets.map((bucket) => {
    const totals = bucket.keys.reduce((sum, key) => {
      const day = stats[key] || {};
      return {
        tasksDone: sum.tasksDone + (day.tasksDone || 0),
        focusSeconds: sum.focusSeconds + (day.focusSeconds || 0),
      };
    }, { tasksDone: 0, focusSeconds: 0 });

    return { ...bucket, ...totals };
  });
  const tasksTotal = values.reduce((sum, value) => sum + value.tasksDone, 0);
  const focusTotal = values.reduce((sum, value) => sum + value.focusSeconds, 0);

  return (
    <section className="personal-space">
      <h2>Personal space</h2>
      <div className="period-picker" aria-label="Statistics period">
        {['week', 'month', 'year'].map((option) => (
          <button
            key={option}
            className={period === option ? 'period-button selected' : 'period-button'}
            onClick={() => setPeriod(option)}
          >
            {option[0].toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>
      <div className="stats-summary">
        <div><strong>{tasksTotal}</strong><span>Tasks done</span></div>
        <div><strong>{formatDuration(focusTotal)}</strong><span>Time focused</span></div>
      </div>
      <BarChart
        title="Tasks done"
        values={values}
        valueKey="tasksDone"
        valueLabel={(value) => `${value} tasks`}
      />
      <BarChart
        title="Time focused"
        values={values}
        valueKey="focusSeconds"
        valueLabel={(value) => formatDuration(value)}
      />
    </section>
  );
}

function BarChart({ title, values, valueKey, valueLabel }) {
  const maximum = Math.max(1, ...values.map((value) => value[valueKey]));

  return (
    <section className="chart">
      <h3>{title}</h3>
      <div className="chart-bars">
        {values.map((value) => {
          const amount = value[valueKey];
          const height = amount ? Math.max(4, (amount / maximum) * 100) : 0;
          return (
            <div className="chart-column" key={value.label} title={`${value.label}: ${valueLabel(amount)}`}>
              <span className="chart-value">{amount ? valueLabel(amount) : ''}</span>
              <div className="chart-track">
                <div className="chart-bar" style={{ height: `${height}%` }} />
              </div>
              <span className="chart-label">{value.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getBuckets(period) {
  const now = new Date();
  const year = now.getFullYear();

  if (period === 'week') {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(year, now.getMonth(), now.getDate() - 6 + index);
      return { label: date.toLocaleDateString(undefined, { weekday: 'short' }), keys: [dateKey(date)] };
    });
  }

  if (period === 'month') {
    const weeks = Math.ceil(new Date(year, now.getMonth() + 1, 0).getDate() / 7);
    return Array.from({ length: weeks }, (_, index) => {
      const week = index + 1;
      const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
      const keys = Array.from({ length: Math.min(7, daysInMonth - index * 7) }, (_, day) =>
        dateKey(new Date(year, now.getMonth(), index * 7 + day + 1)));
      return { label: `W${week}`, keys };
    });
  }

  return Array.from({ length: 12 }, (_, month) => ({
    label: new Date(year, month, 1).toLocaleDateString(undefined, { month: 'short' }),
    keys: Array.from(
      { length: new Date(year, month + 1, 0).getDate() },
      (_, day) => dateKey(new Date(year, month, day + 1)),
    ),
  }));
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (seconds > 0 && minutes === 0) return '<1m';
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}
