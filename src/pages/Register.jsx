
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap, BriefcaseBusiness, ArrowRight,
  Mail, LockKeyhole, UserRound
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [university, setUniversity] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (role === "umkm" && !companyName.trim()) {
      setError("Nama usaha wajib diisi.");
      return;
    }

    setSubmitting(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            name: name.trim(),
            role,
            university: role === "student"
              ? university.trim() || "Universitas"
              : undefined,
            business_name: role === "umkm"
              ? companyName.trim()
              : undefined,
            city: role === "umkm"
              ? city.trim() || "Indonesia"
              : undefined
          }
        }
      });

      if (authError) throw authError;

      if (!data.session) {
        setSuccess(
          "Pendaftaran diproses. Jika konfirmasi email aktif, periksa inbox sebelum login."
        );
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-symbol"><GraduationCap size={28} /></div>

        <h1>Create your account</h1>
        <p className="muted center">
          Join SkillBridge and start collaborating.
        </p>

        <div className="role-selector">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`role-option ${role === "student" ? "selected" : ""}`}
          >
            <GraduationCap size={27} />
            <strong>Student</strong>
            <small>Cari proyek & bangun portofolio</small>
          </button>

          <button
            type="button"
            onClick={() => setRole("umkm")}
            className={`role-option ${role === "umkm" ? "selected" : ""}`}
          >
            <BriefcaseBusiness size={27} />
            <strong>UMKM</strong>
            <small>Temukan talenta digital</small>
          </button>
        </div>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <form onSubmit={handleRegister} className="form-stack">
          <label>
            Full Name
            <div className="input-wrap">
              <UserRound size={18} />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap"
                required
              />
            </div>
          </label>

          {role === "student" ? (
            <label>
              University
              <input
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="Nama universitas"
                className="form-input"
              />
            </label>
          ) : (
            <>
              <label>
                Business Name
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Nama UMKM"
                  className="form-input"
                  required
                />
              </label>
              <label>
                Business Location
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Surabaya"
                  className="form-input"
                />
              </label>
            </>
          )}

          <label>
            Email Address
            <div className="input-wrap">
              <Mail size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
              />
            </div>
          </label>

          <label>
            Password
            <div className="input-wrap">
              <LockKeyhole size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                minLength={8}
                required
              />
            </div>
          </label>

          <label>
            Confirm Password
            <div className="input-wrap">
              <LockKeyhole size={18} />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Ulangi password"
                required
              />
            </div>
          </label>

          <button
            className="btn btn-primary btn-lg btn-full"
            disabled={submitting}
          >
            {submitting ? "Creating account..." : "Create Account"}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-bottom">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
