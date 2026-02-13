import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      {/* Mobile hamburger */}
      <button className="hamburger" onClick={toggleMenu} aria-label="Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Logo - center on mobile */}
      <Link to={isAuthenticated ? "/dashboard" : "/"} className="logo">
        Yoga Path
      </Link>

      {/* Mobile greeting */}
      {isAuthenticated && (
        <span className="greeting-mobile">Hi, {user?.name}</span>
      )}

      {/* Navigation */}
      <nav className={menuOpen ? "open" : ""}>
        {isAuthenticated ? (
          <>
            <div className="nav-links">
              <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
              <Link to="/profile" onClick={closeMenu}>Profile</Link>
              <Link to="/recommendations" onClick={closeMenu}>Recommendations</Link>
              <Link to="/practice-log" onClick={closeMenu}>Practice Log</Link>
            </div>
            <div className="nav-user">
              <span className="greeting-desktop">Hello, {user?.name}</span>
              <button onClick={logout} className="logout-btn" aria-label="Logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="nav-links">
            <Link to="/login" onClick={closeMenu}>Login</Link>
            <Link to="/register" onClick={closeMenu}>Register</Link>
          </div>
        )}
      </nav>

      {/* Mobile overlay */}
      {menuOpen && <div className="nav-overlay" onClick={closeMenu}></div>}
    </header>
  );
}
