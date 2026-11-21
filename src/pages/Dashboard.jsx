
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness, ClipboardList, Users,
  ArrowRight, PlusCircle, ShieldCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon"><Icon size={23} /></div>
      <div>
        <span className="muted">{label}</span>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        let projectQuery = supabase.from("projects").select("*");
        let applicationQuery = supabase
          .from("project_applications")
          .select("*");
        let workspaceQuery = supabase.from("workspaces").select("*");

        if (profile.role === "student") {
          applicationQuery = applicationQuery.eq("student_id", profile.id);
          workspaceQuery = workspaceQuery.eq("student_id", profile.id);
        }

        if (profile.role === "umkm") {
          projectQuery = projectQuery.eq("owner_id", profile.id);
          workspaceQuery = workspaceQuery.eq("umkm_id", profile.id);
        }

        const results = await Promise.all([
          projectQuery.order("created_at", { ascending: false }),
          applicationQuery.order("created_at", { ascending: false }),
          workspaceQuery.order("created_at", { ascending: false }),
          profile.role === "admin"
            ? supabase.from("users").select("id,name,email,role,is_verified")
            : Promise.resolve({ data: [], error: null })
        ]);

        const failed = results.find((r) => r.error);
        if (failed) throw failed.error;

        if (!cancelled) {
          setProjects(results[0].data || []);
          setApplications(results[1].data || []);
          setWorkspaces(results[2].data || []);
          setUsers(results[3].data || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [profile]);

  if (loading) {
    return <div className="page-loading">Memuat dashboard...</div>;
  }

  return (
    <div className="container section">
      <div className="page-header">
        <div>
          <span className="eyebrow">SKILLBRIDGE DASHBOARD</span>
          <h1>Welcome back, {profile.name}! 👋</h1>
          <p className="muted">
            {profile.role === "student"
              ? "Kelola lamaran dan kolaborasi proyekmu."
              : profile.role === "umkm"
              ? "Temukan mahasiswa dan kelola proyek digital usahamu."
              : "Pantau aktivitas pengguna dan proyek SkillBridge."}
          </p>
        </div>

        <Link
          to={profile.role === "umkm" ? "/projects?create=1" : "/projects"}
          className="btn btn-primary"
        >
          {profile.role === "umkm" ? <PlusCircle size={18} /> : <BriefcaseBusiness size={18} />}
          {profile.role === "umkm" ? "Post New Project" : "Explore Projects"}
        </Link>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="grid-3">
        <Stat
          icon={BriefcaseBusiness}
          label={profile.role === "umkm" ? "My Projects" : "Available Projects"}
          value={projects.length}
        />
        <Stat
          icon={ClipboardList}
          label="Applications"
          value={applications.length}
        />
        <Stat
          icon={Users}
          label="Active Workspaces"
          value={workspaces.filter((w) => w.status === "active").length}
        />
      </div>

      {profile.role === "admin" && (
        <section className="dashboard-section">
          <h2><ShieldCheck size={22} /> User Management</h2>
          <div className="panel table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className="pill">{u.role}</span></td>
                    <td>{u.is_verified ? "Verified" : "Pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="dashboard-section">
        <div className="section-header-row">
          <h2>{profile.role === "umkm" ? "My Projects" : "Recent Projects"}</h2>
          <Link to="/projects" className="text-link">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-3">
          {projects.slice(0, 6).map((project) => (
            <div className="project-card" key={project.id}>
              <span className="pill">{project.status}</span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <Link to={`/projects/${project.id}`} className="text-link">
                View Project <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="empty-state">
            Belum ada proyek untuk ditampilkan.
          </div>
        )}
      </section>

      {profile.role === "student" && (
        <section className="dashboard-section">
          <h2>My Applications</h2>
          {applications.length === 0 ? (
            <div className="empty-state">Kamu belum melamar proyek.</div>
          ) : (
            <div className="panel table-scroll">
              <table>
                <thead>
                  <tr><th>Project ID</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {applications.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <Link to={`/projects/${a.project_id}`}>
                          {a.project_id.slice(0, 8)}...
                        </Link>
                      </td>
                      <td><span className="pill">{a.status}</span></td>
                      <td>{new Date(a.created_at).toLocaleDateString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <section className="dashboard-section">
        <h2>My Workspaces</h2>
        {workspaces.length === 0 ? (
          <div className="empty-state">
            Workspace akan tersedia setelah lamaran diterima.
          </div>
        ) : (
          <div className="grid-3">
            {workspaces.map((w) => (
              <div className="project-card" key={w.id}>
                <span className="pill">{w.status}</span>
                <h3>Workspace</h3>
                <p>Progress: {w.progress_percent}%</p>
                <Link to={`/workspace/${w.id}`} className="btn btn-outline">
                  Open Workspace <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
