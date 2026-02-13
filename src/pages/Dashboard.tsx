import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context";
import { profileApi, recommendationApi, practiceLogApi } from "../api";
import { Loading } from "../components/common";
import type {
  YogaProfileResponse,
  YogaRecommendationResponse,
  PracticeLogResponse,
} from "../types";

export function Dashboard() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<YogaProfileResponse | null>(null);
  const [recommendation, setRecommendation] = useState<YogaRecommendationResponse | null>(null);
  const [recentLogs, setRecentLogs] = useState<PracticeLogResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const profileData = await profileApi.getByUserId(user.id).catch(() => null);
        setProfile(profileData);

        if (profileData) {
          const recData = await recommendationApi.getLatest(profileData.id).catch(() => null);
          setRecommendation(recData);
        }

        const logs = await practiceLogApi.getByUserId(user.id).catch(() => []);
        setRecentLogs(logs.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate stats
  const totalMinutesThisWeek = recentLogs.reduce((sum, log) => sum + log.minutesPracticed, 0);
  const sessionsThisWeek = recentLogs.length;

  if (isLoading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <div className="dashboard-banner">
        <h1>Welcome, {user?.name}!</h1>
        <p>Your yoga journey at a glance</p>
      </div>

      {/* Cards Grid */}
      <div className="dashboard-grid">
        {/* Profile Card */}
        <section className="dashboard-card">
          <div className="card-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <h2>Profile</h2>
          </div>
          {profile ? (
            <div className="card-content">
              <div className="stat">
                <span className="stat-value">{profile.weeklyMinutesAvailable}</span>
                <span className="stat-label">min/week</span>
              </div>
              <div className="stat">
                <span className="stat-value">{profile.sessionsPerWeek}</span>
                <span className="stat-label">sessions</span>
              </div>
              <p className="card-detail">
                {profile.goals.length > 0
                  ? profile.goals.map(g => g.name).join(", ")
                  : "No goals selected"}
              </p>
            </div>
          ) : (
            <div className="card-content card-empty">
              <p>Set up your profile to get started</p>
            </div>
          )}
          <Link to="/profile" className="card-link">
            {profile ? "Edit Profile" : "Create Profile"} →
          </Link>
        </section>

        {/* Recommendations Card */}
        <section className="dashboard-card">
          <div className="card-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <h2>Recommendations</h2>
          </div>
          {recommendation ? (
            <div className="card-content">
              <div className="stat">
                <span className="stat-value">{recommendation.totalMinutesPerSession}</span>
                <span className="stat-label">min/session</span>
              </div>
              <p className="card-detail">
                {recommendation.styles.length > 0
                  ? recommendation.styles.map(s => s.name).join(", ")
                  : "No styles"}
              </p>
              {recommendation.isOutdated && (
                <p className="card-warning">Needs update</p>
              )}
            </div>
          ) : (
            <div className="card-content card-empty">
              <p>{profile ? "Generate your first recommendation" : "Create profile first"}</p>
            </div>
          )}
          <Link to="/recommendations" className="card-link">
            View Recommendations →
          </Link>
        </section>

        {/* Practice Log Card */}
        <section className="dashboard-card">
          <div className="card-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <h2>Practice Log</h2>
          </div>
          {recentLogs.length > 0 ? (
            <div className="card-content">
              <div className="stat">
                <span className="stat-value">{sessionsThisWeek}</span>
                <span className="stat-label">sessions</span>
              </div>
              <div className="stat">
                <span className="stat-value">{totalMinutesThisWeek}</span>
                <span className="stat-label">total min</span>
              </div>
              <p className="card-detail">
                Last: {new Date(recentLogs[0].practiceDate).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="card-content card-empty">
              <p>Start tracking your practice</p>
            </div>
          )}
          <Link to="/practice-log" className="card-link">
            View All Logs →
          </Link>
        </section>
      </div>
    </div>
  );
}
