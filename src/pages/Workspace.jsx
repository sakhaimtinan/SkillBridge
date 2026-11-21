
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Send, Plus, CheckCircle2,
  MessageSquare, ClipboardList
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Workspace() {
  const { id } = useParams();
  const { profile } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWorkspace() {
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    setWorkspace(data);
  }

  async function loadTasks() {
    const { data, error } = await supabase
      .from("project_tasks")
      .select("*")
      .eq("workspace_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    setTasks(data || []);
  }

  async function loadMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("workspace_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    setMessages(data || []);
  }

  useEffect(() => {
    let active = true;

    async function initialize() {
      setLoading(true);
      try {
        await Promise.all([
          loadWorkspace(),
          loadTasks(),
          loadMessages()
        ]);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    const channel = supabase
      .channel(`workspace-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `workspace_id=eq.${id}`
        },
        () => loadMessages().catch(console.error)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_tasks",
          filter: `workspace_id=eq.${id}`
        },
        () => loadTasks().catch(console.error)
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [id]);

  async function addTask(event) {
    event.preventDefault();
    if (!taskTitle.trim()) return;

    setError("");

    const { error } = await supabase
      .from("project_tasks")
      .insert({
        workspace_id: id,
        title: taskTitle.trim(),
        is_completed: false,
        created_by: profile.id
      });

    if (error) {
      setError(error.message);
      return;
    }

    setTaskTitle("");
    await loadTasks();
  }

  async function toggleTask(task) {
    setError("");

    const { error } = await supabase
      .from("project_tasks")
      .update({ is_completed: !task.is_completed })
      .eq("id", task.id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadTasks();
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!messageText.trim()) return;

    setError("");

    const { error } = await supabase
      .from("messages")
      .insert({
        workspace_id: id,
        sender_id: profile.id,
        content: messageText.trim()
      });

    if (error) {
      setError(error.message);
      return;
    }

    setMessageText("");
    await loadMessages();
  }

  if (loading) {
    return <div className="page-loading">Memuat workspace...</div>;
  }

  if (error && !workspace) {
    return (
      <div className="container section">
        <div className="alert error">{error}</div>
        <Link to="/dashboard">Kembali</Link>
      </div>
    );
  }

  if (!workspace) return null;

  const completed = tasks.filter((task) => task.is_completed).length;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  return (
    <div className="container section">
      <Link to="/dashboard" className="text-link">
        <ArrowLeft size={17} /> Back to Dashboard
      </Link>

      <div className="page-header">
        <div>
          <span className="eyebrow">COLLABORATION WORKSPACE</span>
          <h1>Project Workspace</h1>
          <p className="muted">Kelola tugas dan komunikasi proyek dalam satu tempat.</p>
        </div>
        <span className="pill">{workspace.status}</span>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="grid-3">
        <div className="stat-card">
          <ClipboardList />
          <div><span className="muted">Total Tasks</span><h2>{tasks.length}</h2></div>
        </div>
        <div className="stat-card">
          <CheckCircle2 />
          <div><span className="muted">Completed</span><h2>{completed}</h2></div>
        </div>
        <div className="stat-card">
          <MessageSquare />
          <div><span className="muted">Messages</span><h2>{messages.length}</h2></div>
        </div>
      </div>

      <div className="panel progress-panel">
        <div className="section-header-row">
          <strong>Task Progress</strong>
          <strong>{progress}%</strong>
        </div>
        <div className="progress-track">
          <div style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="workspace-grid">
        <section className="panel detail-panel">
          <h2>Project Tasks</h2>

          <form onSubmit={addTask} className="task-add">
            <input
              className="form-input"
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="Add a new task..."
              required
            />
            <button className="btn btn-primary">
              <Plus size={17} /> Add
            </button>
          </form>

          {tasks.length === 0 && (
            <div className="empty-state">Belum ada task.</div>
          )}

          <div className="task-list">
            {tasks.map((task) => (
              <label className="task-item" key={task.id}>
                <input
                  type="checkbox"
                  checked={task.is_completed}
                  onChange={() => toggleTask(task)}
                />
                <span className={task.is_completed ? "task-done" : ""}>
                  {task.title}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="panel chat-panel">
          <h2><MessageSquare size={20} /> Project Chat</h2>

          <div className="chat-messages">
            {messages.length === 0 && (
              <p className="muted center">Belum ada pesan. Mulai percakapan!</p>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.sender_id === profile.id
                    ? "chat-bubble mine"
                    : "chat-bubble"
                }
              >
                <small>
                  {message.sender_id === profile.id
                    ? "You"
                    : "Project Partner"}
                </small>
                <p>{message.content}</p>
                <span>
                  {new Date(message.created_at).toLocaleTimeString(
                    "id-ID", { hour: "2-digit", minute: "2-digit" }
                  )}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="chat-compose">
            <input
              className="form-input"
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              placeholder="Type a message..."
              required
            />
            <button className="btn btn-primary" aria-label="Send message">
              <Send size={18} />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
