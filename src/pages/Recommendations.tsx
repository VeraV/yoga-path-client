import { useState, useEffect } from "react";
import { useAuth } from "../context";
import { profileApi, recommendationApi } from "../api";
import { Loading, ErrorMessage } from "../components/common";
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
      <h1>Your Yoga Recommendations</h1>

      {error && <ErrorMessage message={error} />}

      {recommendation?.isOutdated && (
        <div>
          <p className="warning">
            Your profile has been updated since these recommendations were
            generated. Consider generating new recommendations.
          </p>
          <button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Recommendations"}
          </button>
        </div>
      )}

      {!recommendation ? (
        <div>
          <p>No recommendations yet. Generate your personalized yoga plan!</p>
          <button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Recommendations"}
          </button>
        </div>
      ) : (
        <div>
          <h2>Current Recommendation</h2>
          <p>
            <strong>Created:</strong>{" "}
            {new Date(recommendation.createdAt).toLocaleDateString()}
          </p>

          <h3>
            Session Breakdown ({recommendation.totalMinutesPerSession} minutes)
          </h3>
          <ul>
            <li>Asana (poses): {recommendation.asanaMinutes} min</li>
            <li>
              Pranayama (breathing): {recommendation.pranayamaMinutes} min
            </li>
            <li>Meditation: {recommendation.meditationMinutes} min</li>
            <li>Relaxation: {recommendation.relaxationMinutes} min</li>
            <li>Mantra: {recommendation.mantraMinutes} min</li>
          </ul>

          <h3>Recommended Yoga Styles</h3>
          {recommendation.styles.length > 0 ? (
            <ul>
              {recommendation.styles.map((style) => (
                <li key={style.id}>
                  <strong>{style.name}</strong> - {style.description}
                </li>
              ))}
            </ul>
          ) : (
            <p>No specific styles recommended.</p>
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
