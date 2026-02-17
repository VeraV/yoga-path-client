import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context";
import { practiceLogApi } from "../api";
import { Loading, ErrorMessage } from "../components/common";
import type { PracticeLogResponse, PracticeLogRequest } from "../types";

type PracticeLogFormData = Omit<PracticeLogRequest, "userId">;

export function PracticeLog() {
  const { user } = useAuth();

  const [logs, setLogs] = useState<PracticeLogResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    register: practiceLog,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PracticeLogFormData>({
    defaultValues: {
      practiceDate: new Date().toISOString().split("T")[0],
      minutesPracticed: 30,
      notes: "",
    },
  });

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return;

      try {
        const data = await practiceLogApi.getByUserId(user.id);
        setLogs(data);
      } catch (err) {
        setError("Failed to load practice logs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  const onSubmit = async (data: PracticeLogFormData) => {
    if (!user) return;

    setError("");

    try {
      const newLog = await practiceLogApi.create({
        ...data,
        userId: user.id,
        notes: data.notes || undefined,
      });
      setLogs((prev) => [newLog, ...prev]);
      reset({
        practiceDate: new Date().toISOString().split("T")[0],
        minutesPracticed: 30,
        notes: "",
      });
    } catch (err) {
      setError("Failed to add practice log");
    }
  };

  const handleDelete = async (logId: number) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      await practiceLogApi.delete(logId);
      setLogs((prev) => prev.filter((log) => log.id !== logId));
    } catch (err) {
      setError("Failed to delete practice log");
    }
  };

  if (isLoading) {
    return <Loading message="Loading practice logs..." />;
  }

  return (
    <div className="practice-log-page">
      <h1>Practice Log</h1>

      {error && <ErrorMessage message={error} />}

      <div className="practice-log-content">
        {/* Left column - Log new practice */}
        <fieldset className="practice-log-group">
          <legend>Log New Practice</legend>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="field-row">
              <label htmlFor="practiceDate">Date</label>
              <input
                id="practiceDate"
                type="date"
                className="input-small"
                {...practiceLog("practiceDate", {
                  required: "Date is required",
                })}
              />
              {errors.practiceDate && (
                <span className="field-error">{errors.practiceDate.message}</span>
              )}
            </div>

            <div className="field-row">
              <label htmlFor="minutesPracticed">Minutes</label>
              <input
                id="minutesPracticed"
                type="number"
                className="input-small"
                {...practiceLog("minutesPracticed", {
                  required: "Minutes is required",
                  min: { value: 1, message: "Minimum 1 minute" },
                  max: { value: 300, message: "Maximum 300 minutes" },
                  valueAsNumber: true,
                })}
              />
              {errors.minutesPracticed && (
                <span className="field-error">{errors.minutesPracticed.message}</span>
              )}
            </div>

            <div>
              <label htmlFor="notes">Notes (optional)</label>
              <textarea
                id="notes"
                rows={3}
                {...practiceLog("notes")}
              />
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Entry"}
            </button>
          </form>
        </fieldset>

        {/* Right column - Practice history */}
        <fieldset className="practice-log-group">
          <legend>Practice History</legend>
          {logs.length === 0 ? (
            <p className="empty-message">No practice sessions logged yet. Start tracking your yoga journey!</p>
          ) : (
            <div className="practice-log-list">
              {logs.map((log) => (
                <div key={log.id} className="log-item">
                  <div className="log-header">
                    <span className="log-date">
                      {new Date(log.practiceDate).toLocaleDateString()}
                    </span>
                    <span className="log-minutes">{log.minutesPracticed} min</span>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(log.id)}
                    >
                      Delete
                    </button>
                  </div>
                  {log.notes && <p className="log-notes">{log.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </fieldset>
      </div>
    </div>
  );
}
