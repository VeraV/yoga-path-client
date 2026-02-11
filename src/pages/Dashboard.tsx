import { useAuth } from '../context';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <h1>Welcome, {user?.name}!</h1>
      <p>This is your Yoga Path dashboard.</p>
    </div>
  );
}
