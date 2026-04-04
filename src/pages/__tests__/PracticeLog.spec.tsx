import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { PracticeLog } from "../PracticeLog";

const mockUseAuth = jest.fn();
const mockGetByUserId = jest.fn();
const mockCreate = jest.fn();
const mockDelete = jest.fn();

jest.mock("../../context", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("../../api", () => ({
  practiceLogApi: {
    getByUserId: (...args: unknown[]) => mockGetByUserId(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

jest.mock("../../components/common", () => ({
  Loading: ({ message }: { message?: string }) => <p>{message}</p>,
  ErrorMessage: ({ message }: { message: string }) => <p>{message}</p>,
}));

const authUser = { id: 1, name: "Test User", email: "test@example.com" };

const existingLogs = [
  { id: 1, userId: 1, practiceDate: "2026-04-01", minutesPracticed: 45, notes: "Morning flow", createdAt: "2026-04-01T08:00:00" },
  { id: 2, userId: 1, practiceDate: "2026-03-30", minutesPracticed: 30, notes: "", createdAt: "2026-03-30T09:00:00" },
];

function renderPracticeLog() {
  return render(
    <MemoryRouter>
      <PracticeLog />
    </MemoryRouter>,
  );
}

describe("PracticeLog Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: authUser });
  });

  it("shows loading state while fetching data", () => {
    mockGetByUserId.mockReturnValue(new Promise(() => {}));

    renderPracticeLog();

    expect(screen.getByText("Loading practice logs...")).toBeInTheDocument();
  });

  it("shows error when fetch fails", async () => {
    mockGetByUserId.mockRejectedValue(new Error("fail"));

    renderPracticeLog();

    await waitFor(() => {
      expect(screen.getByText("Failed to load practice logs")).toBeInTheDocument();
    });
  });

  it("shows empty state when no logs exist", async () => {
    mockGetByUserId.mockResolvedValue([]);

    renderPracticeLog();

    await waitFor(() => {
      expect(screen.getByText("No practice sessions logged yet. Start tracking your yoga journey!")).toBeInTheDocument();
    });
  });

  it("renders form with default values", async () => {
    mockGetByUserId.mockResolvedValue([]);

    renderPracticeLog();

    await waitFor(() => {
      expect(screen.getByLabelText("Minutes")).toHaveValue(30);
    });

    expect(screen.getByLabelText("Date")).toHaveValue(new Date().toISOString().split("T")[0]);
    expect(screen.getByLabelText("Notes (optional)")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Add Entry" })).toBeInTheDocument();
  });

  it("displays existing practice logs", async () => {
    mockGetByUserId.mockResolvedValue(existingLogs);

    renderPracticeLog();

    await waitFor(() => {
      expect(screen.getByText("45 min")).toBeInTheDocument();
    });
    expect(screen.getByText("Morning flow")).toBeInTheDocument();
    expect(screen.getByText("30 min")).toBeInTheDocument();
  });

  describe("creating a log", () => {
    beforeEach(() => {
      mockGetByUserId.mockResolvedValue([]);
    });

    it("creates a new log and prepends it to the list", async () => {
      const u = userEvent.setup();
      const newLog = { id: 3, userId: 1, practiceDate: "2026-04-02", minutesPracticed: 60, notes: "Evening session", createdAt: "2026-04-02T18:00:00" };
      mockCreate.mockResolvedValue(newLog);

      renderPracticeLog();

      await waitFor(() => {
        expect(screen.getByLabelText("Minutes")).toBeInTheDocument();
      });

      const minutesInput = screen.getByLabelText("Minutes");
      await u.clear(minutesInput);
      await u.type(minutesInput, "60");
      await u.type(screen.getByLabelText("Notes (optional)"), "Evening session");
      await u.click(screen.getByRole("button", { name: "Add Entry" }));

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledTimes(1);
        expect(screen.getByText("60 min")).toBeInTheDocument();
        expect(screen.getByText("Evening session")).toBeInTheDocument();
      });
    });

    it("shows error on failed create", async () => {
      const u = userEvent.setup();
      mockCreate.mockRejectedValue(new Error("fail"));

      renderPracticeLog();

      await waitFor(() => {
        expect(screen.getByLabelText("Minutes")).toBeInTheDocument();
      });

      await u.click(screen.getByRole("button", { name: "Add Entry" }));

      await waitFor(() => {
        expect(screen.getByText("Failed to add practice log")).toBeInTheDocument();
      });
    });
  });

  describe("deleting a log", () => {
    beforeEach(() => {
      mockGetByUserId.mockResolvedValue(existingLogs);
    });

    it("deletes a log after confirmation and removes it from list", async () => {
      const u = userEvent.setup();
      mockDelete.mockResolvedValue(undefined);
      jest.spyOn(window, "confirm").mockReturnValue(true);

      renderPracticeLog();

      await waitFor(() => {
        expect(screen.getByText("45 min")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
      await u.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith(1);
        expect(screen.queryByText("45 min")).not.toBeInTheDocument();
      });
    });

    it("does not delete when confirmation is cancelled", async () => {
      const u = userEvent.setup();
      jest.spyOn(window, "confirm").mockReturnValue(false);

      renderPracticeLog();

      await waitFor(() => {
        expect(screen.getByText("45 min")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
      await u.click(deleteButtons[0]);

      expect(mockDelete).not.toHaveBeenCalled();
      expect(screen.getByText("45 min")).toBeInTheDocument();
    });

    it("shows error on failed delete", async () => {
      const u = userEvent.setup();
      mockDelete.mockRejectedValue(new Error("fail"));
      jest.spyOn(window, "confirm").mockReturnValue(true);

      renderPracticeLog();

      await waitFor(() => {
        expect(screen.getByText("45 min")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
      await u.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Failed to delete practice log")).toBeInTheDocument();
      });
    });
  });

  describe("validation", () => {
    beforeEach(() => {
      mockGetByUserId.mockResolvedValue([]);
    });

    it("shows error when minutes is below minimum", async () => {
      const u = userEvent.setup();
      renderPracticeLog();

      await waitFor(() => {
        expect(screen.getByLabelText("Minutes")).toBeInTheDocument();
      });

      const minutesInput = screen.getByLabelText("Minutes");
      await u.clear(minutesInput);
      await u.type(minutesInput, "0");
      await u.click(screen.getByRole("button", { name: "Add Entry" }));

      await waitFor(() => {
        expect(screen.getByText("Minimum 1 minute")).toBeInTheDocument();
      });
    });

    it("shows error when minutes exceeds maximum", async () => {
      const u = userEvent.setup();
      renderPracticeLog();

      await waitFor(() => {
        expect(screen.getByLabelText("Minutes")).toBeInTheDocument();
      });

      const minutesInput = screen.getByLabelText("Minutes");
      await u.clear(minutesInput);
      await u.type(minutesInput, "500");
      await u.click(screen.getByRole("button", { name: "Add Entry" }));

      await waitFor(() => {
        expect(screen.getByText("Maximum 300 minutes")).toBeInTheDocument();
      });
    });
  });
});
