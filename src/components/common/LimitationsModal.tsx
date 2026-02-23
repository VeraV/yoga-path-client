import { useState, useEffect } from "react";
import { referenceApi } from "../../api";
import type { Limitation } from "../../types";

interface Props {
  onClose: () => void;
}

export function LimitationsModal({ onClose }: Props) {
  const [limitations, setLimitations] = useState<Limitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    referenceApi
      .getLimitations()
      .then((data) => setLimitations(data))
      .catch(() => setError("Failed to load limitations"))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Limitations</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body">
          {isLoading && <p>Loading...</p>}
          {error && <p className="error-message">{error}</p>}
          {!isLoading && !error && (
            <table className="limitations-table">
              <tbody>
                {limitations.map((l) => (
                  <tr key={l.id}>
                    <td className="col-name">{l.name}</td>
                    <td className="col-description">{l.description}</td>
                    <td className="col-notes">{l.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
