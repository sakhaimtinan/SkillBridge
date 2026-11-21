
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Workspace from "./pages/Workspace";

function Protected({ children, roles = [] }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-loading">
        Memuat akun SkillBridge...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (!profile) {
    return (
      <div className="container section">
        <div className="alert error">
          Akun berhasil login, tetapi profil database belum ditemukan.
          Periksa trigger pembuatan user di Supabase.
        </div>
      </div>
    );
  }

  if (roles.length && !roles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/projects" element={<Projects />} />

        <Route
          path="/projects/:id"
          element={<ProjectDetail />}
        />

        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />

        <Route
          path="/workspace/:id"
          element={
            <Protected roles={["student", "umkm", "admin"]}>
              <Workspace />
            </Protected>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
