import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context";
import { profileApi, referenceApi } from "../api";
import { Loading, ErrorMessage } from "../components/common";
import type { YogaProfileResponse, YogaProfileRequest, Goal } from "../types";

type ProfileFormData = Omit<YogaProfileRequest, "userId">;

export function Profile() {
  const { user } = useAuth();

  const [profileData, setProfileData] = useState<YogaProfileResponse | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register: profile,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    defaultValues: {
      weeklyMinutesAvailable: 60,
      sessionsPerWeek: 3,
      dynamicPreference: "NO_PREFERENCE",
      structurePreference: "NO_PREFERENCE",
      philosophyOpenness: "NO_PREFERENCE",
      goalIds: [],
    },
  });

  const selectedGoalIds = watch("goalIds");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [fetchedProfile, goalsData] = await Promise.all([
          profileApi.getByUserId(user.id).catch(() => null),
          referenceApi.getGoals(),
        ]);

        setGoals(goalsData);

        if (fetchedProfile) {
          setProfileData(fetchedProfile);
          reset({
            weeklyMinutesAvailable: fetchedProfile.weeklyMinutesAvailable,
            sessionsPerWeek: fetchedProfile.sessionsPerWeek,
            dynamicPreference: fetchedProfile.dynamicPreference,
            structurePreference: fetchedProfile.structurePreference,
            philosophyOpenness: fetchedProfile.philosophyOpenness,
            goalIds: fetchedProfile.goals.map((g) => g.id),
          });
        }
      } catch (err) {
        setError("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, reset]);

  const handleGoalToggle = (goalId: number) => {
    const current = selectedGoalIds || [];
    const updated = current.includes(goalId)
      ? current.filter((id) => id !== goalId)
      : [...current, goalId];
    setValue("goalIds", updated);
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setError("");
    setSuccessMessage("");

    const requestData: YogaProfileRequest = {
      ...data,
      userId: user.id,
    };

    try {
      if (profileData) {
        const updated = await profileApi.update(profileData.id, requestData);
        setProfileData(updated);
      } else {
        const created = await profileApi.create(requestData);
        setProfileData(created);
      }
      setSuccessMessage("Profile saved successfully!");
    } catch (err) {
      setError("Failed to save profile");
    }
  };

  if (isLoading) {
    return <Loading message="Loading profile..." />;
  }

  return (
    <div className="profile-page">
      <h1>Your Yoga Profile</h1>

      {error && <ErrorMessage message={error} />}
      {successMessage && <p className="success">{successMessage}</p>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="profile-groups">
          {/* Availability */}
          <fieldset className="profile-group">
            <legend>Availability</legend>
            <div className="field-row">
              <label htmlFor="weeklyMinutesAvailable">Weekly minutes</label>
              <input
                id="weeklyMinutesAvailable"
                type="number"
                className="input-small"
                {...profile("weeklyMinutesAvailable", {
                  required: "Required",
                  min: { value: 15, message: "Min 15" },
                  max: { value: 600, message: "Max 600" },
                  valueAsNumber: true,
                })}
              />
              {errors.weeklyMinutesAvailable && (
                <span className="field-error">{errors.weeklyMinutesAvailable.message}</span>
              )}
            </div>
            <div className="field-row">
              <label htmlFor="sessionsPerWeek">Sessions per week</label>
              <input
                id="sessionsPerWeek"
                type="number"
                className="input-small"
                {...profile("sessionsPerWeek", {
                  required: "Required",
                  min: { value: 1, message: "Min 1" },
                  max: { value: 7, message: "Max 7" },
                  valueAsNumber: true,
                })}
              />
              {errors.sessionsPerWeek && (
                <span className="field-error">{errors.sessionsPerWeek.message}</span>
              )}
            </div>
          </fieldset>

          {/* Preferences */}
          <fieldset className="profile-group">
            <legend>Preferences</legend>
            <div>
              <label htmlFor="dynamicPreference">Practice style</label>
              <select id="dynamicPreference" {...profile("dynamicPreference")}>
                <option value="NO_PREFERENCE">No preference</option>
                <option value="DYNAMIC">Dynamic (more movement)</option>
                <option value="STATIC">Static (holding poses)</option>
              </select>
            </div>
            <div>
              <label htmlFor="structurePreference">Structure</label>
              <select id="structurePreference" {...profile("structurePreference")}>
                <option value="NO_PREFERENCE">No preference</option>
                <option value="STRUCTURED">Structured (fixed sequences)</option>
                <option value="CREATIVE">Creative (varied sequences)</option>
              </select>
            </div>
            <div>
              <label htmlFor="philosophyOpenness">Philosophy</label>
              <select id="philosophyOpenness" {...profile("philosophyOpenness")}>
                <option value="NO_PREFERENCE">No preference</option>
                <option value="OPEN">Open to yoga philosophy</option>
                <option value="NOT_OPEN">Focus on physical practice</option>
              </select>
            </div>
          </fieldset>

          {/* Goals */}
          <fieldset className="profile-group profile-goals">
            <legend>Goals</legend>
            <div className="goals-grid">
              {goals.map((goal) => (
                <label key={goal.id} className="goal-item" title={goal.description}>
                  <input
                    type="checkbox"
                    checked={selectedGoalIds?.includes(goal.id) || false}
                    onChange={() => handleGoalToggle(goal.id)}
                  />
                  <span>{goal.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : profileData
              ? "Update Profile"
              : "Create Profile"}
        </button>
      </form>
    </div>
  );
}
