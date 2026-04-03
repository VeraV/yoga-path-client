import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Dashboard } from "../Dashboard";

const mockUseAuth = jest.fn();
const mockGetByUserId = jest.fn();
const mockGetLatest = jest.fn();
const mockGetLogsByUserId = jest.fn();

jest.mock("../../context", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("../../api", () => ({
  profileApi: {
    getByUserId: (...args: unknown[]) => mockGetByUserId(...args),
  },
  recommendationApi: {
    getLatest: (...args: unknown[]) => mockGetLatest(...args),
  },
  practiceLogApi: {
    getByUserId: (...args: unknown[]) => mockGetLogsByUserId(...args),
  },
}));

jest.mock("../../components/common", () => ({
  Loading: ({ message }: { message?: string }) => <p>{message}</p>,
}));

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

const user = { id: 1, name: "Test User", email: "test@example.com" };

const profile = {
  id: 10,
  weeklyMinutesAvailable: 120,
  sessionsPerWeek: 3,
  goals: [{ id: 1, name: "Flexibility" }, { id: 2, name: "Strength" }],
};

const recommendation = {
  totalMinutesPerSession: 40,
  styles: [{ name: "Hatha" }, { name: "Vinyasa" }],
  isOutdated: false,
};

const recentLogs = [
  { id: 1, practiceDate: "2026-04-01", minutesPracticed: 30 },
  { id: 2, practiceDate: "2026-03-30", minutesPracticed: 45 },
];

describe("Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user });
  });

  it("shows loading state while fetching data", () => {
    mockGetByUserId.mockReturnValue(new Promise(() => {}));
    mockGetLogsByUserId.mockReturnValue(new Promise(() => {}));

    renderDashboard();

    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });

  it("displays welcome message with user name", async () => {
    mockGetByUserId.mockResolvedValue(profile);
    mockGetLatest.mockResolvedValue(recommendation);
    mockGetLogsByUserId.mockResolvedValue(recentLogs);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Welcome, Test User!")).toBeInTheDocument();
    });
  });

  describe("profile card", () => {
    it("shows profile stats when profile exists", async () => {
      mockGetByUserId.mockResolvedValue(profile);
      mockGetLatest.mockResolvedValue(recommendation);
      mockGetLogsByUserId.mockResolvedValue(recentLogs);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText("120")).toBeInTheDocument();
      });
      expect(screen.getByText("Flexibility, Strength")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Edit Profile →" })).toHaveAttribute("href", "/profile");
    });

    it("shows empty state when no profile", async () => {
      mockGetByUserId.mockResolvedValue(null);
      mockGetLogsByUserId.mockResolvedValue([]);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText("Set up your profile to get started")).toBeInTheDocument();
      });
      expect(screen.getByRole("link", { name: "Create Profile →" })).toHaveAttribute("href", "/profile");
    });
  });

  describe("recommendations card", () => {
    it("shows recommendation stats when available", async () => {
      mockGetByUserId.mockResolvedValue(profile);
      mockGetLatest.mockResolvedValue(recommendation);
      mockGetLogsByUserId.mockResolvedValue([]);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText("40")).toBeInTheDocument();
      });
      expect(screen.getByText("Hatha, Vinyasa")).toBeInTheDocument();
    });

    it("shows outdated warning when recommendation is outdated", async () => {
      mockGetByUserId.mockResolvedValue(profile);
      mockGetLatest.mockResolvedValue({ ...recommendation, isOutdated: true });
      mockGetLogsByUserId.mockResolvedValue([]);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText("Needs update")).toBeInTheDocument();
      });
    });

    it("shows 'Create profile first' when no profile", async () => {
      mockGetByUserId.mockResolvedValue(null);
      mockGetLogsByUserId.mockResolvedValue([]);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText("Create profile first")).toBeInTheDocument();
      });
    });

    it("shows 'Generate your first recommendation' when profile exists but no recommendation", async () => {
      mockGetByUserId.mockResolvedValue(profile);
      mockGetLatest.mockResolvedValue(null);
      mockGetLogsByUserId.mockResolvedValue([]);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText("Generate your first recommendation")).toBeInTheDocument();
      });
    });
  });

  describe("practice log card", () => {
    it("shows log stats when logs exist", async () => {
      mockGetByUserId.mockResolvedValue(profile);
      mockGetLatest.mockResolvedValue(recommendation);
      mockGetLogsByUserId.mockResolvedValue(recentLogs);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText("2")).toBeInTheDocument();
      });
      expect(screen.getByText("75")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "View All Logs →" })).toHaveAttribute("href", "/practice-log");
    });

    it("shows empty state when no logs", async () => {
      mockGetByUserId.mockResolvedValue(profile);
      mockGetLatest.mockResolvedValue(recommendation);
      mockGetLogsByUserId.mockResolvedValue([]);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText("Start tracking your practice")).toBeInTheDocument();
      });
    });
  });
});
