import { useEffect, useMemo, useState } from "react";

async function request(path, options) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || "Could not complete that request.");
  }
  return response.status === 204 ? null : response.json();
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    request("/api/tasks")
      .then(setTasks)
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  const visibleTasks = useMemo(
    () => tasks.filter((task) => filter === "all" || (filter === "done" ? task.completed : !task.completed)),
    [tasks, filter],
  );
  const remaining = tasks.filter((task) => !task.completed).length;
  const completed = tasks.length - remaining;

  async function addTask(event) {
    event.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      const task = await request("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      setTasks((current) => [task, ...current]);
      setTitle("");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    setError("");
    try {
      const updated = await request("/api/tasks", {
        method: "PATCH",
        body: JSON.stringify({ id: task._id, completed: !task.completed }),
      });
      setTasks((current) => current.map((item) => (item._id === updated._id ? updated : item)));
    } catch (reason) {
      setError(reason.message);
    }
  }

  async function deleteTask(task) {
    setError("");
    try {
      await request("/api/tasks", {
        method: "DELETE",
        body: JSON.stringify({ id: task._id }),
      });
      setTasks((current) => current.filter((item) => item._id !== task._id));
    } catch (reason) {
      setError(reason.message);
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Daylist home">
          <span className="brand-mark" aria-hidden="true">d.</span>
          <span>daylist</span>
        </a>
        <span className="top-note"><span className="status-dot" /> a little more done</span>
      </header>

      <section className="todo-card" aria-labelledby="page-title">
        <div className="intro">
          <span className="eyebrow">YOUR PERSONAL TODO LIST</span>
          <h1 id="page-title">Make room for<br /><span>what matters.</span></h1>
          <p>One thing at a time. You’ve got this.</p>
        </div>

        <form className="add-form" onSubmit={addTask}>
          <label className="sr-only" htmlFor="new-task">Add a task</label>
          <span className="add-icon" aria-hidden="true">+</span>
          <input
            id="new-task"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            placeholder="What needs doing?"
          />
          <button type="submit" disabled={saving || !title.trim()}>{saving ? "Adding…" : "Add task"}</button>
        </form>

        <div className="list-heading">
          <div>
            <h2>Your tasks <span className="count">{remaining}</span></h2>
            <p>{remaining === 0 ? "All caught up — nicely done." : `${remaining} ${remaining === 1 ? "thing" : "things"} left on your list`}</p>
          </div>
          <div className="filters" aria-label="Filter tasks">
            {["all", "active", "done"].map((option) => (
              <button
                className={filter === option ? "filter active" : "filter"}
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                aria-pressed={filter === option}
              >
                {option === "done" ? "Done" : option[0].toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-message" role="alert">{error}</div>}

        <div className="task-list" aria-live="polite">
          {loading ? (
            <div className="empty-state"><span className="loader" />Loading your list…</div>
          ) : visibleTasks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">{filter === "done" ? "✦" : "✓"}</span>
              <strong>{filter === "done" ? "Nothing checked off yet" : filter === "active" ? "No tasks left to do" : "A clear list is a fresh start"}</strong>
              <span>{filter === "done" ? "Finish a task and it’ll show up here." : filter === "active" ? "Enjoy the breathing room." : "Add a task above to get started."}</span>
            </div>
          ) : (
            visibleTasks.map((task) => (
              <article className={task.completed ? "task completed" : "task"} key={task._id}>
                <button
                  className="check-button"
                  type="button"
                  onClick={() => toggleTask(task)}
                  aria-label={task.completed ? `Mark ${task.title} as not done` : `Mark ${task.title} as done`}
                  aria-pressed={task.completed}
                >
                  {task.completed && <span aria-hidden="true">✓</span>}
                </button>
                <span className="task-title">{task.title}</span>
                <button
                  className="delete-button"
                  type="button"
                  onClick={() => deleteTask(task)}
                  aria-label={`Delete ${task.title}`}
                >×</button>
              </article>
            ))
          )}
        </div>

        <footer className="card-footer">
          <span><span className="footer-star">✳</span> Small steps still move you forward.</span>
          {completed > 0 && <button className="clear-button" type="button" onClick={async () => {
            const doneTasks = tasks.filter((task) => task.completed);
            await Promise.all(doneTasks.map((task) => deleteTask(task)));
          }}>Clear completed</button>}
        </footer>
      </section>
      <p className="page-footer">A calmer way to get things done <span>·</span> one day at a time</p>
    </main>
  );
}

export default App;
