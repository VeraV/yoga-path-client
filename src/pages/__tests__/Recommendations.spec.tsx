import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Recommendations } from "../Recommendations";

const mockUseAuth = jest.fn();
const mockGetByUserId = jest.fn();
const mockGetLatest = jest.fn();
const mockGetHistory = jest.fn();
const mockGenerate = jest.fn();

jest.mock("../../context", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("../../api", () => ({
  profileApi: {
    getByUserId: (...args: unknown[]) => mockGetByUserId(...args),
  },
  recommendationApi: {
    getLatest: (...args: unknown[]) => mockGetLatest(...args),
    getHistory: (...args: unknown[]) => mockGetHistory(...args),
    generate: (...args: unknown[]) => mockGenerate(...args),
  },
}));

jest.mock("../../components/common", () => ({
  Loading: ({ message }: { message?: string }) => <p>{message}</p>,
  ErrorMessage: ({ message }: { message: string }) => <p>{message}</p>,
  LimitationsModal: ({ onClose }: { onClose: () => void }) => (
    <div>
      <p>Limitations Modal</p>
      <button onClick={onClose}>Close Modal</button>
    </div>
  ),
}));

const authUser = { id: 1, name: "Test User", email: "test@example.com" };

const profile = {
  id: 10,
  userId: 1,
  weeklyMinutesAvailable: 120,
  sessionsPerWeek: 3,
  goals: [
    { id: 1, name: "Flexibility", description: "", notes: "Stretch daily" },
    { id: 2, name: "Stress Relief", description: "", notes: "Practice breathing" },
  ],
  updatedAt: "2026-01-01T00:00:00",
};

const recommendation = {
  id: 1,
  profileId: 10,
  asanaMinutes: 20,
  pranayamaMinutes: 8,
  meditationMinutes: 5,
  relaxationMinutes: 5,
  mantraMinutes: 2,
  totalMinutesPerSession: 40,
  styles: [
    { id: 1, name: "Hatha", description: "Traditional", notes: "Good for beginners" },
    { id: 2, name: "Vinyasa", description: "Flow", notes: "Dynamic practice" },
  ],
  isOutdated: false,
  createdAt: "2026-01-02T00:00:00",
};

const olderRecommendation = {
  ...recommendation,
  id: 0,
  totalMinutesPerSession: 35,
  styles: [{ id: 1, name: "Hatha", description: "Traditional", notes: "" }],
  createdAt: "2025-12-15T00:00:00",
};

function renderRecommendations() {
  return render(
    <MemoryRouter>
      <Recommendations />
    </MemoryRouter>,
  );
}

describe("Recommendations Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: authUser });
  });

  it("shows loading state while fetching data", () => {
    mockGetByUserId.mockReturnValue(new Promise(() => {}));

    renderRecommendations();

    expect(screen.getByText("Loading recommendations...")).toBeInTheDocument();
  });

  it("shows 'create profile first' when no profile exists", async () => {
    mockGetByUserId.mockResolvedValue(null);

    renderRecommendations();

    await waitFor(() => {
      expect(
        screen.getByText("Please create your profile first to get personalized recommendations."),
      ).toBeInTheDocument();
    });
  });

  describe("no recommendation yet", () => {
    beforeEach(() => {
      mockGetByUserId.mockResolvedValue(profile);
      mockGetLatest.mockResolvedValue(null);
      mockGetHistory.mockResolvedValue([]);
    });

    it("shows message and Generate button", async () => {
      renderRecommendations();

      await waitFor(() => {
        expect(screen.getByText("No recommendations yet. Generate your personalized yoga plan!")).toBeInTheDocument();
      });
      expect(screen.getByRole("button", { name: "Generate Recommendations" })).toBeInTheDocument();
    });

    it("calls generate and displays new recommendation", async () => {
      const u = userEvent.setup();
      mockGenerate.mockResolvedValue(recommendation);

      renderRecommendations();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Generate Recommendations" })).toBeInTheDocument();
      });

      await u.click(screen.getByRole("button", { name: "Generate Recommendations" }));

      await waitFor(() => {
        expect(mockGenerate).toHaveBeenCalledWith(10);
        expect(screen.getByText("40")).toBeInTheDocument();
      });
    });

    it("shows error on failed generate", async () => {
      const u = userEvent.setup();
      mockGenerate.mockRejectedValue(new Error("fail"));

      renderRecommendations();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Generate Recommendations" })).toBeInTheDocument();
      });

      await u.click(screen.getByRole("button", { name: "Generate Recommendations" }));

      await waitFor(() => {
        expect(screen.getByText("Failed to generate recommendations")).toBeInTheDocument();
      });
    });
  });

  describe("with recommendation", () => {
    beforeEach(() => {
      mockGetByUserId.mockResolvedValue(profile);
      mockGetLatest.mockResolvedValue(recommendation);
      mockGetHistory.mockResolvedValue([recommendation]);
    });

    it("displays session breakdown", async () => {
      renderRecommendations();

      await waitFor(() => {
        expect(screen.getByText("40")).toBeInTheDocument();
      });

      const items = document.querySelectorAll(".session-item");
      const getMinutes = (label: string) => {
        const item = Array.from(items).find((el) => el.querySelector(".item-label")?.textContent === label);
        return item?.querySelector(".item-value")?.textContent;
      };

      expect(getMinutes("Asana (exercises)")).toBe("20 min");
      expect(getMinutes("Pranayama (breathing)")).toBe("8 min");
      expect(getMinutes("Relaxation")).toBe("5 min");
      expect(getMinutes("Meditation")).toBe("5 min");
      expect(getMinutes("Mantra")).toBe("2 min");
    });

    it("displays matched styles", async () => {
      renderRecommendations();

      await waitFor(() => {
        expect(screen.getByText("Hatha")).toBeInTheDocument();
      });
      expect(screen.getByText("Good for beginners")).toBeInTheDocument();
      expect(screen.getByText("Vinyasa")).toBeInTheDocument();
    });

    it("displays goal notes in 'Beyond the Mat' section", async () => {
      renderRecommendations();

      await waitFor(() => {
        expect(screen.getByText("Beyond the Mat")).toBeInTheDocument();
      });
      expect(screen.getByText("Stretch daily")).toBeInTheDocument();
      expect(screen.getByText("Practice breathing")).toBeInTheDocument();
    });

    it("does not show Generate button when recommendation is current", async () => {
      renderRecommendations();

      await waitFor(() => {
        expect(screen.getByText("40")).toBeInTheDocument();
      });
      expect(screen.queryByRole("button", { name: "Generate Recommendations" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Regenerate Recommendations" })).not.toBeInTheDocument();
    });
  });

  describe("outdated recommendation", () => {
    beforeEach(() => {
      mockGetByUserId.mockResolvedValue(profile);
      mockGetLatest.mockResolvedValue({ ...recommendation, isOutdated: true });
      mockGetHistory.mockResolvedValue([{ ...recommendation, isOutdated: true }]);
    });

    it("shows outdated warning and Regenerate button", async () => {
      renderRecommendations();

      await waitFor(() => {
        expect(
          screen.getByText(/Your profile has been updated since these recommendations were generated/),
        ).toBeInTheDocument();
      });
      expect(screen.getByRole("button", { name: "Regenerate Recommendations" })).toBeInTheDocument();
    });
  });

  describe("history", () => {
    it("shows history section when there are older recommendations", async () => {
      mockGetByUserId.mockResolvedValue(profile);
      mockGetLatest.mockResolvedValue(recommendation);
      mockGetHistory.mockResolvedValue([recommendation, olderRecommendation]);

      renderRecommendations();

      await waitFor(() => {
        expect(screen.getByText("Recommendation History")).toBeInTheDocument();
      });
      expect(screen.getByText(/35 min\/session/)).toBeInTheDocument();
    });

    it("does not show history section with only one recommendation", async () => {
      mockGetByUserId.mockResolvedValue(profile);
      mockGetLatest.mockResolvedValue(recommendation);
      mockGetHistory.mockResolvedValue([recommendation]);

      renderRecommendations();

      await waitFor(() => {
        expect(screen.getByText("40")).toBeInTheDocument();
      });
      expect(screen.queryByText("Recommendation History")).not.toBeInTheDocument();
    });
  });

  describe("limitations modal", () => {
    beforeEach(() => {
      mockGetByUserId.mockResolvedValue(profile);
      mockGetLatest.mockResolvedValue(recommendation);
      mockGetHistory.mockResolvedValue([recommendation]);
    });

    it("opens limitations modal when Health Considerations button is clicked", async () => {
      const u = userEvent.setup();
      renderRecommendations();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Health Considerations" })).toBeInTheDocument();
      });

      await u.click(screen.getByRole("button", { name: "Health Considerations" }));

      expect(screen.getByText("Limitations Modal")).toBeInTheDocument();
    });

    it("closes limitations modal", async () => {
      const u = userEvent.setup();
      renderRecommendations();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Health Considerations" })).toBeInTheDocument();
      });

      await u.click(screen.getByRole("button", { name: "Health Considerations" }));
      await u.click(screen.getByRole("button", { name: "Close Modal" }));

      expect(screen.queryByText("Limitations Modal")).not.toBeInTheDocument();
    });
  });
});
