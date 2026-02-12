import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <img src="/logo.ico" alt="Yoga Path Logo" className="hero-logo" width={300} height={300} />
        <h1>Yoga Path</h1>
        <p>Your Personalized Practice Planner</p>
        <p>
          Discover the perfect yoga routine tailored to your goals, preferences,
          and schedule. Get personalized recommendations for asana, pranayama,
          meditation, and more.
        </p>
        <div className="hero-actions">
          <Link to="/register">Get Started</Link>
          <Link to="/login">Login</Link>
        </div>
      </section>

      <section className="features">
        <h2>What You Get</h2>
        <ul>
          <li>
            <strong>Personalized Recommendations</strong> - Yoga styles and
            session plans based on your preferences
          </li>
          <li>
            <strong>Balanced Practice</strong> - Custom mix of asana, pranayama,
            meditation, relaxation, and mantra
          </li>
          <li>
            <strong>Track Your Progress</strong> - Log your practice sessions
            and watch your journey unfold
          </li>
        </ul>
      </section>
    </div>
  );
}
