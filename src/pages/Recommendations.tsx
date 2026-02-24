import { useState, useEffect } from "react";
import { useAuth } from "../context";
import { profileApi, recommendationApi } from "../api";
import { Loading, ErrorMessage, LimitationsModal } from "../components/common";
import type { YogaProfileResponse, YogaRecommendationResponse } from "../types";

export function Recommendations() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<YogaProfileResponse | null>(null);
  const [recommendation, setRecommendation] =
    useState<YogaRecommendationResponse | null>(null);
  const [history, setHistory] = useState<YogaRecommendationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [showLimitations, setShowLimitations] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const profileData = await profileApi
          .getByUserId(user.id)
          .catch(() => null);
        setProfile(profileData);

        if (profileData) {
          const [recData, historyData] = await Promise.all([
            recommendationApi.getLatest(profileData.id).catch(() => null),
            recommendationApi.getHistory(profileData.id).catch(() => []),
          ]);
          setRecommendation(recData);
          setHistory(historyData);
        }
      } catch (err) {
        setError("Failed to load recommendations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleGenerate = async () => {
    if (!profile) return;

    setError("");
    setIsGenerating(true);

    try {
      const newRec = await recommendationApi.generate(profile.id);
      setRecommendation(newRec);
      setHistory((prev) => [newRec, ...prev]);
    } catch (err) {
      setError("Failed to generate recommendations");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <Loading message="Loading recommendations..." />;
  }

  if (!profile) {
    return (
      <div className="recommendations-page">
        <h1>Recommendations</h1>
        <p>
          Please create your profile first to get personalized recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      <div className="recommendations-header">
        <h1>Your Yoga Recommendations</h1>
        <button
          className="btn-secondary"
          onClick={() => setShowLimitations(true)}
        >
          Health Considerations
        </button>
      </div>

      <p className="health-notice">
        Some health conditions may require practice modifications. Please review
        this list and consult your teacher or healthcare provider when
        necessary.
      </p>

      {showLimitations && (
        <LimitationsModal onClose={() => setShowLimitations(false)} />
      )}

      {error && <ErrorMessage message={error} />}

      {/* Warning when session time is too short to fit all minimums */}
      {recommendation &&
        profile &&
        (() => {
          const expected = Math.floor(
            profile.weeklyMinutesAvailable / profile.sessionsPerWeek,
          );
          console.log(
            `expected: ${expected}, recommendation.totalMinutesPerSession: ${recommendation.totalMinutesPerSession}`,
          );
          return recommendation.totalMinutesPerSession > expected;
        })() && (
          <p className="warning">
            Your session time is too short to fit all recommended minimums.
            Consider increasing your available time per session.
          </p>
        )}

      {/* Warning when outdated */}
      {recommendation?.isOutdated && (
        <p className="warning">
          Your profile has been updated since these recommendations were
          generated. Consider generating new recommendations.
        </p>
      )}

      {/* Message when no recommendations */}
      {!recommendation && (
        <p>No recommendations yet. Generate your personalized yoga plan!</p>
      )}

      {/* Button: show when no recommendation OR when outdated */}
      {(!recommendation || recommendation.isOutdated) && (
        <div className="generate-section">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-generate"
          >
            {isGenerating
              ? "Generating..."
              : recommendation
                ? "Regenerate Recommendations"
                : "Generate Recommendations"}
          </button>
        </div>
      )}

      {recommendation && (
        <div className="recommendation-content">
          {/* Left column - Session breakdown */}
          <fieldset className="recommendation-group">
            <legend>Session Breakdown</legend>
            <p className="session-total">
              <span className="total-value">
                {recommendation.totalMinutesPerSession}
              </span>
              <span className="total-label">minutes per session</span>
            </p>
            <div className="session-details">
              <div className="session-item">
                <span className="item-label">Asana (exercises)</span>
                <span className="item-value">
                  {recommendation.asanaMinutes} min
                </span>
              </div>
              <div className="session-item">
                <span className="item-label">Pranayama (breathing)</span>
                <span className="item-value">
                  {recommendation.pranayamaMinutes} min
                </span>
              </div>
              <div className="session-item">
                <span className="item-label">Relaxation</span>
                <span className="item-value">
                  {recommendation.relaxationMinutes} min
                </span>
              </div>
              <div className="session-item">
                <span className="item-label">Meditation</span>
                <span className="item-value">
                  {recommendation.meditationMinutes} min
                </span>
              </div>
              <div className="session-item">
                <span className="item-label">Mantra</span>
                <span className="item-value">
                  {recommendation.mantraMinutes} min
                </span>
              </div>
            </div>
            <p className="recommendation-date">
              Created: {new Date(recommendation.createdAt).toLocaleDateString()}
            </p>
          </fieldset>

          {/* Right column - Yoga styles */}
          <fieldset className="recommendation-group">
            <legend>Recommended Styles</legend>
            {recommendation.styles.length > 0 ? (
              <div className="styles-list">
                {recommendation.styles.map((style) => (
                  <div key={style.id} className="style-item">
                    <h4>{style.name}</h4>
                    <p>{style.notes}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No specific styles recommended.</p>
            )}
          </fieldset>

          {profile.goals.length > 0 && (
            <fieldset className="recommendation-group recommendation-group--full">
              <legend>Beyond the Mat</legend>
              <p className="group-description">
                Here are some ideas to support your goals — to fill in your
                yoga practice and beyond that time on a mat.
              </p>
              <div className="styles-list">
                {profile.goals.map((goal) => (
                  <div key={goal.id} className="style-item">
                    <h4>{goal.name}</h4>
                    {goal.notes && <p>{goal.notes}</p>}
                  </div>
                ))}
              </div>
            </fieldset>
          )}
        </div>
      )}

      {history.length > 1 && (
        <div className="recommendation-history">
          <h2>Recommendation History</h2>
          <ul>
            {history.slice(1).map((rec) => (
              <li key={rec.id}>
                <strong>{new Date(rec.createdAt).toLocaleDateString()}</strong>
                {" - "}
                {rec.totalMinutesPerSession} min/session
                {rec.styles.length > 0 && (
                  <span> ({rec.styles.map((s) => s.name).join(", ")})</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
