
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LogOut,
  LayoutDashboard,
  BriefcaseBusiness,
  Menu
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="nav-inner">
          <Link to="/" className="brand">
            <span className="brand-icon">
              <GraduationCap size={25} />
            </span>
            <span>
              <strong>SkillBridge</strong>
              <small>Academia × Enterprise</small>
            </span>
          </Link>

          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Buka menu"
          >
            <Menu />
          </button>

          <nav className={menuOpen ? "nav-links open" : "nav-links"}>
            <NavLink to="/" onClick={() => setMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/projects" onClick={() => setMenuOpen(false)}>
              Marketplace
            </NavLink>
            {profile && (
              <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>
                Dashboard
              </NavLink>
            )}
          </nav>

          <div className="nav-actions">
            {profile ? (
              <>
                <span className="nav-user">
                  {profile.name}
                  <small>{profile.role.toUpperCase()}</small>
                </span>
                <button className="btn btn-outline" onClick={logout}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <strong>SkillBridge</strong>
          <span>Connecting Student Talent with UMKM Opportunities</span>
          <small>© 2026 SkillBridge. Prototype MVP.</small>
        </div>
      </footer>
    </div>
  );
}
