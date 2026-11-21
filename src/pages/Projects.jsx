
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search, PlusCircle, BriefcaseBusiness, ArrowRight,
  MapPin, Clock3, Wallet
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  title: "",
  category_id: "",
  description: "",
  required_skills: "",
  budget: "0",
  duration_weeks: "4",
  difficulty_level: "Intermediate",
  location: "",
  deadline: ""
};

export default function Projects() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(searchParams.get("create") === "1");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    const [projectResponse, categoryResponse] = await Promise.all([
      supabase
        .from("projects_with_details")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("categories")
        .select("id,name")
        .order("name")
    ]);

    if (projectResponse.error) {
      setError(projectResponse.error.message);
    } else {
      setProjects(projectResponse.data || []);
    }

    if (categoryResponse.error) {
      setError(categoryResponse.error.message);
    } else {
      setCategories(categoryResponse.data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateField(event) {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value
    }));
  }

  async function createProject(event) {
    event.preventDefault();

    if (profile?.role !== "umkm") {
      setError("Hanya UMKM yang bisa membuat proyek.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        title: form.title.trim(),
        category_id: form.category_id,
        owner_id: profile.id,
        description: form.description.trim(),
        required_skills: form.required_skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        budget: Number(form.budget),
        duration_weeks: Number(form.duration_weeks),
        difficulty_level: form.difficulty_level,
        location: form.location.trim() || null,
        deadline: form.deadline || null,
        status: "recruiting",
        published_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from("projects")
        .insert(payload);

      if (insertError) throw insertError;

      setSuccess("Proyek berhasil dipublikasikan!");
      setForm(initialForm);
      setShowForm(false);
      setSearchParams({});
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const filteredProjects = projects.filter((project) => {
    const query = search.toLowerCase();
    const searchable = [
      project.title,
      project.description,
      project.category_name,
      project.umkm_name
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });

  return (
    <div className="container section">
      <div className="page-header">
        <div>
          <span className="eyebrow">PROJECT MARKETPLACE</span>
          <h1>Discover Your Next Opportunity</h1>
          <p className="muted">
            Temukan proyek digital dan mulai kolaborasi bersama UMKM.
          </p>
        </div>

        {profile?.role === "umkm" && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            <PlusCircle size={18} /> Post New Project
          </button>
        )}
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {showForm && profile?.role === "umkm" && (
        <div className="panel form-panel">
          <div className="section-header-row">
            <h2>Create New Project</h2>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>
              Close
            </button>
          </div>

          <form onSubmit={createProject} className="form-stack">
            <label>
              Project Title
              <input
                className="form-input"
                name="title"
                value={form.title}
                onChange={updateField}
                minLength={5}
                maxLength={200}
                required
                placeholder="Contoh: Desain Website Katalog UMKM"
              />
            </label>

            <div className="grid-2">
              <label>
                Category
                <select
                  className="form-input"
                  name="category_id"
                  value={form.category_id}
                  onChange={updateField}
                  required
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Difficulty Level
                <select
                  className="form-input"
                  name="difficulty_level"
                  value={form.difficulty_level}
                  onChange={updateField}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </label>
            </div>

            <label>
              Project Description
              <textarea
                className="form-input"
                name="description"
                rows={5}
                value={form.description}
                onChange={updateField}
                required
                placeholder="Jelaskan kebutuhan digital UMKM kamu..."
              />
            </label>

            <label>
              Required Skills
              <input
                className="form-input"
                name="required_skills"
                value={form.required_skills}
                onChange={updateField}
                placeholder="UI/UX, Figma, HTML, Digital Marketing"
              />
              <small className="muted">Pisahkan skill dengan koma.</small>
            </label>

            <div className="grid-2">
              <label>
                Budget (Rp)
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  name="budget"
                  value={form.budget}
                  onChange={updateField}
                  required
                />
              </label>

              <label>
                Duration (Weeks)
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  max="52"
                  name="duration_weeks"
                  value={form.duration_weeks}
                  onChange={updateField}
                  required
                />
              </label>

              <label>
                Location
                <input
                  className="form-input"
                  name="location"
                  value={form.location}
                  onChange={updateField}
                  placeholder="Surabaya / Remote"
                />
              </label>

              <label>
                Deadline
                <input
                  className="form-input"
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={updateField}
                />
              </label>
            </div>

            <button
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? "Publishing..." : "Publish Project"}
            </button>
          </form>
        </div>
      )}

      <div className="search-bar">
        <Search size={20} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search projects, skills, or categories..."
        />
      </div>

      {loading ? (
        <div className="page-loading">Memuat marketplace...</div>
      ) : (
        <div className="grid-3">
          {filteredProjects.map((project) => (
            <div className="project-card" key={project.id}>
              <div className="card-top-row">
                <span className="pill">{project.category_name || "Project"}</span>
                <span className="pill light">{project.status}</span>
              </div>

              <h3>{project.title}</h3>
              <p>{project.description}</p>

              <div className="skill-tags">
                {(project.required_skills || []).slice(0, 4).map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>

              <div className="project-meta">
                <span><BriefcaseBusiness size={15} /> {project.umkm_name || "UMKM"}</span>
                <span><MapPin size={15} /> {project.location || "Remote"}</span>
                <span><Clock3 size={15} /> {project.duration_weeks} weeks</span>
                <span>
                  <Wallet size={15} />
                  Rp {Number(project.budget).toLocaleString("id-ID")}
                </span>
              </div>

              <Link
                to={`/projects/${project.id}`}
                className="btn btn-outline btn-full"
              >
                View Details <ArrowRight size={17} />
              </Link>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredProjects.length === 0 && (
        <div className="empty-state">
          Belum ada proyek yang cocok dengan pencarian.
        </div>
      )}
    </div>
  );
}
