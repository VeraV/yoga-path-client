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

      <h2>Log New Practice</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="practiceDate">Date</label>
          <input
            id="practiceDate"
            type="date"
            {...practiceLog("practiceDate", {
              required: "Date is required",
            })}
          />
          {errors.practiceDate && (
            <span className="field-error">{errors.practiceDate.message}</span>
          )}
        </div>

        <div>
          <label htmlFor="minutesPracticed">Minutes practiced</label>
          <input
            id="minutesPracticed"
            type="number"
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

      <h2>Your Practice History</h2>
      {logs.length === 0 ? (
        <p>No practice sessions logged yet. Start tracking your yoga journey!</p>
      ) : (
        <ul className="practice-log-list">
          {logs.map((log) => (
            <li key={log.id}>
              <strong>{new Date(log.practiceDate).toLocaleDateString()}</strong>
              {" - "}
              {log.minutesPracticed} minutes
              {log.notes && <p>{log.notes}</p>}
              <button onClick={() => handleDelete(log.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
