import { Link } from 'react-router-dom';
import { useAuth } from '../../context';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="header">
      <Link to="/">Yoga Path</Link>

      <nav>
        {isAuthenticated ? (
          <>
            <span>Hello, {user?.name}</span>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/recommendations">Recommendations</Link>
            <Link to="/practice-log">Practice Log</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
