
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Send } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function ProjectDetail() {
  const { id } = useParams();
  const { profile } = useAuth();

  const [project, setProject] = useState(null);
  const [applications, setApplications] = useState([]);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const owner = profile && project?.owner_id === profile.id;
  const student = profile?.role === "student";

  async function loadProject() {
    setLoading(true);
    setError("");

    const { data, error: projectError } = await supabase
      .from("projects_with_details")
      .select("*")
      .eq("id", id)
      .single();

    if (projectError) {
      setError(projectError.message);
      setLoading(false);
      return;
    }

    setProject(data);

    if (profile) {
      const { data: apps, error: appsError } = await supabase
        .from("project_applications")
        .select("id,project_id,student_id,status,cover_letter,created_at")
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (appsError) {
        setError(appsError.message);
      } else {
        setApplications(apps || []);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProject();
  }, [id, profile?.id]);

  async function apply(event) {
    event.preventDefault();

    if (!profile || !student) return;

    if (applications.some((app) => app.student_id === profile.id)) {
      setError("Kamu sudah pernah melamar proyek ini.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { error: insertError } = await supabase
        .from("project_applications")
        .insert({
          project_id: id,
          student_id: profile.id,
          cover_letter: coverLetter.trim(),
          status: "pending"
        });

      if (insertError) throw insertError;

      setSuccess("Lamaran berhasil dikirim!");
      setCoverLetter("");
      await loadProject();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateApplication(applicationId, status) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await supabase
        .from("project_applications")
        .update({ status })
        .eq("id", applicationId);

      if (updateError) throw updateError;

      setSuccess(
        status === "accepted"
          ? "Lamaran diterima. Workspace otomatis dibuat."
          : "Lamaran ditolak."
      );

      await loadProject();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="page-loading">Memuat detail proyek...</div>;
  }

  if (!project) {
    return (
      <div className="container section">
        <div className="alert error">{error || "Proyek tidak ditemukan."}</div>
        <Link to="/projects">Kembali ke Marketplace</Link>
      </div>
    );
  }

  const myApplication = applications.find(
    (app) => app.student_id === profile?.id
  );

  return (
    <div className="container section">
      <Link to="/projects" className="text-link">
        <ArrowLeft size={17} /> Back to Marketplace
      </Link>

      <div className="detail-grid">
        <div>
          <div className="panel detail-panel">
            <span className="pill">{project.category_name}</span>
            <h1>{project.title}</h1>
            <p className="muted">
              Posted by {project.umkm_name || "UMKM"} · {project.location || "Remote"}
            </p>

            <hr />

            <h3>Project Description</h3>
            <p className="detail-description">{project.description}</p>

            <h3>Required Skills</h3>
            <div className="skill-tags">
              {(project.required_skills || []).map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>

            <h3>Project Information</h3>
            <div className="detail-info">
              <p>Budget: <strong>Rp {Number(project.budget).toLocaleString("id-ID")}</strong></p>
              <p>Duration: <strong>{project.duration_weeks} weeks</strong></p>
              <p>Difficulty: <strong>{project.difficulty_level}</strong></p>
              <p>Status: <strong>{project.status}</strong></p>
              <p>Deadline: <strong>{project.deadline || "Not specified"}</strong></p>
            </div>
          </div>

          {owner && (
            <div className="panel detail-panel">
              <h2>Project Applicants ({applications.length})</h2>

              {applications.length === 0 && (
                <div className="empty-state">Belum ada pelamar.</div>
              )}

              {applications.map((app) => (
                <div className="applicant-card" key={app.id}>
                  <div className="section-header-row">
                    <div>
                      <strong>Student: {app.student_id.slice(0, 8)}...</strong>
                      <p className="muted">
                        {new Date(app.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <span className="pill">{app.status}</span>
                  </div>

                  <p>{app.cover_letter || "Tidak ada cover letter."}</p>

                  {app.status === "pending" && (
                    <div className="button-row">
                      <button
                        className="btn btn-primary"
                        disabled={saving}
                        onClick={() => updateApplication(app.id, "accepted")}
                      >
                        <CheckCircle2 size={17} /> Accept
                      </button>
                      <button
                        className="btn btn-outline"
                        disabled={saving}
                        onClick={() => updateApplication(app.id, "rejected")}
                      >
                        <XCircle size={17} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <aside>
          <div className="panel detail-panel sticky-panel">
            <h3>Ready to Collaborate?</h3>
            <p className="muted">
              Mulai perjalanan proyek bersama UMKM.
            </p>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            {!profile && (
              <Link to="/login" className="btn btn-primary btn-full">
                Login to Apply
              </Link>
            )}

            {student && project.status === "recruiting" && !myApplication && (
              <form onSubmit={apply} className="form-stack">
                <label>
                  Your Cover Letter
                  <textarea
                    className="form-input"
                    rows={6}
                    value={coverLetter}
                    onChange={(event) => setCoverLetter(event.target.value)}
                    placeholder="Jelaskan mengapa kamu cocok mengerjakan proyek ini..."
                    required
                  />
                </label>

                <button className="btn btn-primary btn-full" disabled={saving}>
                  <Send size={17} /> {saving ? "Submitting..." : "Apply Now"}
                </button>
              </form>
            )}

            {myApplication && (
              <div className="alert success">
                Status lamaranmu: <strong>{myApplication.status}</strong>
                {myApplication.status === "accepted" && (
                  <p>
                    <Link to="/dashboard" className="text-link">
                      Buka dashboard untuk mengakses workspace.
                    </Link>
                  </p>
                )}
              </div>
            )}

            {student && project.status !== "recruiting" && !myApplication && (
              <div className="alert">
                Proyek ini sudah tidak membuka lamaran.
              </div>
            )}

            {owner && (
              <div className="alert">
                Ini adalah proyek milik UMKM kamu.
                Kelola pelamar pada panel sebelah.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
