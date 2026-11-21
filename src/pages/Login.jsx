
import { useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate
} from "react-router-dom";

import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================
  // SUPABASE CONNECTION DIAGNOSTIC
  // =====================================

  function checkSupabaseConfig() {
    const rawURL = import.meta.env.VITE_SUPABASE_URL;
    const publishableKey =
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const url = String(rawURL || "").trim();

    console.group("[SkillBridge] Supabase Diagnostic");

    console.log("Supabase URL:", url);
    console.log("Publishable Key tersedia:", Boolean(publishableKey));
    console.log("Supabase Client tersedia:", Boolean(supabase));

    console.groupEnd();

    if (!url) {
      throw new Error(
        "VITE_SUPABASE_URL belum diisi di .env.local."
      );
    }

    let parsedURL;

    try {
      parsedURL = new URL(url);
    } catch {
      throw new Error(
        "Format Supabase URL tidak valid."
      );
    }

    if (parsedURL.protocol !== "https:") {
      throw new Error(
        "Supabase URL harus menggunakan https://"
      );
    }

    if (
      parsedURL.pathname !== "/" ||
      parsedURL.search ||
      parsedURL.hash
    ) {
      throw new Error(
        "Supabase URL harus berupa Project URL saja, " +
        "tanpa tambahan /auth, /dashboard, atau path lainnya."
      );
    }

    if (
      !parsedURL.hostname.endsWith(".supabase.co")
    ) {
      throw new Error(
        "Supabase URL tidak sesuai. Gunakan Project URL " +
        "dari Supabase Dashboard → Project Settings → Data API."
      );
    }

    if (
      parsedURL.hostname.includes("PROJECT_REF") ||
      url.includes("abcdefghijk")
    ) {
      throw new Error(
        "Supabase URL masih menggunakan contoh, bukan URL asli."
      );
    }

    if (
      !publishableKey ||
      publishableKey.includes("ISI_KEY_KAMU")
    ) {
      throw new Error(
        "Publishable Key belum diisi dengan key Supabase asli."
      );
    }

    return true;
  }

  // =====================================
  // LOGIN
  // =====================================

  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      checkSupabaseConfig();

      console.log("[SkillBridge] Mencoba login...");

      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });

      if (authError) {
        console.error(
          "[SkillBridge] Login error:",
          authError
        );

        throw authError;
      }

      if (!data?.user) {
        throw new Error(
          "Login tidak mengembalikan data pengguna."
        );
      }

      console.log(
        "[SkillBridge] Login berhasil. User ID:",
        data.user.id
      );

      setSuccess(
        "Login berhasil! Mengalihkan ke dashboard..."
      );

      const redirect = location.state?.from;

      const safeRedirect =
        typeof redirect === "string" &&
        redirect.startsWith("/") &&
        !redirect.startsWith("//");

      navigate(
        safeRedirect ? redirect : "/dashboard",
        { replace: true }
      );

    } catch (err) {
      console.error(
        "[SkillBridge] Authentication failed:",
        err
      );

      const message = String(err?.message || "");

      if (/invalid login credentials/i.test(message)) {
        setError("Email atau password salah.");
      } else if (/email not confirmed/i.test(message)) {
        setError(
          "Email belum dikonfirmasi. Periksa inbox email kamu."
        );
      } else if (/invalid path specified/i.test(message)) {
        setError(
          "Invalid path specified in request URL. " +
          "Periksa Supabase URL di Console browser."
        );
      } else if (/failed to fetch/i.test(message)) {
        setError(
          "Gagal terhubung ke Supabase. Periksa jaringan dan Project URL."
        );
      } else {
        setError(
          message || "Terjadi kesalahan saat login."
        );
      }

    } finally {
      setSubmitting(false);
    }
  }

  // =====================================
  // FORGOT PASSWORD
  // =====================================

  async function handleForgotPassword() {
    setError("");
    setSuccess("");

    if (!email.trim() || !email.includes("@")) {
      setError(
        "Masukkan alamat email yang valid terlebih dahulu."
      );
      return;
    }

    try {
      checkSupabaseConfig();

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          {
            redirectTo: `${window.location.origin}/login`
          }
        );

      if (resetError) {
        throw resetError;
      }

      setSuccess(
        "Jika email terdaftar, tautan pemulihan akan dikirim. " +
        "Halaman untuk membuat password baru masih perlu disiapkan."
      );
    } catch (err) {
      console.error("[SkillBridge] Reset error:", err);
      setError(
        err.message || "Gagal meminta reset password."
      );
    }
  }

  // =====================================
  // PASSWORD VISIBILITY
  // =====================================

  function togglePassword() {
    setShowPassword((previous) => !previous);
  }

  // =====================================
  // EXISTING SESSION
  // =====================================

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // =====================================
  // UI
  // =====================================

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-symbol">
          <GraduationCap size={28} />
        </div>

        <h1>Welcome back</h1>

        <p className="muted center">
          Sign in to continue to your dashboard.
        </p>

        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert success" role="status">
            {success}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="form-stack"
        >

          {/* EMAIL */}
          <label>
            Email Address

            <div className="input-wrap">
              <Mail size={18} />

              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                autoComplete="email"
              />
            </div>
          </label>

          {/* PASSWORD */}
          <label>
            Password

            <div className="input-wrap">
              <LockKeyhole size={18} />

              <input
                type={
                  showPassword ? "text" : "password"
                }
                placeholder="Masukkan password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                autoComplete="current-password"
              />

              <button
                type="button"
                className="icon-button"
                onClick={togglePassword}
                aria-label={
                  showPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </label>

          {/* OPTIONS */}
          <div className="form-between">
            <span className="muted">
              Secure login with Supabase
            </span>

            <button
              type="button"
              className="link-button"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={submitting || loading}
          >
            {submitting
              ? "Signing in..."
              : "Sign In"}

            <ArrowRight size={18} />
          </button>

        </form>

        <p className="auth-bottom">
          Don't have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}
