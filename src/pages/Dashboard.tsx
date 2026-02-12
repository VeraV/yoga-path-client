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

  if (isLoading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard-page">
      <h1>Welcome, {user?.name}!</h1>

      <section className="dashboard-section">
        <h2>Your Profile</h2>
        {profile ? (
          <div>
            <p><strong>Weekly minutes:</strong> {profile.weeklyMinutesAvailable}</p>
            <p><strong>Sessions per week:</strong> {profile.sessionsPerWeek}</p>
            <p><strong>Goals:</strong> {profile.goals.length > 0
              ? profile.goals.map(g => g.name).join(", ")
              : "None selected"}</p>
            <Link to="/profile">Edit Profile</Link>
          </div>
        ) : (
          <div>
            <p>You haven't created your profile yet.</p>
            <Link to="/profile">Create Profile</Link>
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Latest Recommendation</h2>
        {recommendation ? (
          <div>
            <p><strong>Session length:</strong> {recommendation.totalMinutesPerSession} minutes</p>
            <p><strong>Styles:</strong> {recommendation.styles.length > 0
              ? recommendation.styles.map(s => s.name).join(", ")
              : "None"}</p>
            <p><strong>Created:</strong> {new Date(recommendation.createdAt).toLocaleDateString()}</p>
            {recommendation.isOutdated && (
              <p className="warning">Profile updated - consider regenerating</p>
            )}
            <Link to="/recommendations">View Recommendations</Link>
          </div>
        ) : (
          <div>
            <p>{profile ? "No recommendations yet." : "Create a profile first."}</p>
            <Link to="/recommendations">Go to Recommendations</Link>
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Recent Practice</h2>
        {recentLogs.length > 0 ? (
          <div>
            <ul>
              {recentLogs.map((log) => (
                <li key={log.id}>
                  {new Date(log.practiceDate).toLocaleDateString()} - {log.minutesPracticed} min
                </li>
              ))}
            </ul>
            <Link to="/practice-log">View All Logs</Link>
          </div>
        ) : (
          <div>
            <p>No practice sessions logged yet.</p>
            <Link to="/practice-log">Log Your Practice</Link>
          </div>
        )}
      </section>
    </div>
  );
}
