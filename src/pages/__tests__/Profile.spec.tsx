import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Profile } from "../Profile";

const mockUseAuth = jest.fn();
const mockGetByUserId = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockGetGoals = jest.fn();

jest.mock("../../context", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("../../api", () => ({
  profileApi: {
    getByUserId: (...args: unknown[]) => mockGetByUserId(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
  },
  referenceApi: {
    getGoals: (...args: unknown[]) => mockGetGoals(...args),
  },
}));

jest.mock("../../components/common", () => ({
  Loading: ({ message }: { message?: string }) => <p>{message}</p>,
  ErrorMessage: ({ message }: { message: string }) => <p>{message}</p>,
}));

const user = { id: 1, name: "Test User", email: "test@example.com" };

const goals = [
  { id: 1, name: "Physical Fitness", description: "Improve strength", notes: "" },
  { id: 2, name: "Stress Relief", description: "Reduce stress", notes: "" },
  { id: 3, name: "Flexibility", description: "Increase flexibility", notes: "" },
];

const existingProfile = {
  id: 10,
  userId: 1,
  weeklyMinutesAvailable: 120,
  sessionsPerWeek: 3,
  dynamicPreference: "DYNAMIC",
  structurePreference: "STRUCTURED",
  philosophyOpenness: "OPEN",
  goals: [{ id: 1, name: "Physical Fitness", description: "Improve strength", notes: "" }],
  createdAt: "2026-01-01T00:00:00",
  updatedAt: "2026-01-01T00:00:00",
};

function renderProfile() {
  return render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>,
  );
}

describe("Profile Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user });
  });

  it("shows loading state while fetching data", () => {
    mockGetByUserId.mockReturnValue(new Promise(() => {}));
    mockGetGoals.mockReturnValue(new Promise(() => {}));

    renderProfile();

    expect(screen.getByText("Loading profile...")).toBeInTheDocument();
  });

  it("shows error when data fetch fails", async () => {
    mockGetByUserId.mockResolvedValue(null);
    mockGetGoals.mockRejectedValue(new Error("fail"));

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText("Failed to load profile data")).toBeInTheDocument();
    });
  });

  describe("new profile (no existing profile)", () => {
    beforeEach(() => {
      mockGetByUserId.mockResolvedValue(null);
      mockGetGoals.mockResolvedValue(goals);
    });

    it("renders form fields with default values", async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByLabelText("Weekly minutes")).toHaveValue(60);
      });

      expect(screen.getByLabelText("Sessions per week")).toHaveValue(3);
      expect(screen.getByLabelText("Practice style")).toHaveValue("NO_PREFERENCE");
      expect(screen.getByLabelText("Structure")).toHaveValue("NO_PREFERENCE");
      expect(screen.getByLabelText("Philosophy")).toHaveValue("NO_PREFERENCE");
    });

    it("renders goal checkboxes", async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByText("Physical Fitness")).toBeInTheDocument();
      });

      expect(screen.getByText("Stress Relief")).toBeInTheDocument();
      expect(screen.getByText("Flexibility")).toBeInTheDocument();
    });

    it("shows 'Create Profile' button", async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Create Profile" })).toBeInTheDocument();
      });
    });

    it("calls create on submit and shows success message", async () => {
      const u = userEvent.setup();
      mockCreate.mockResolvedValue({ ...existingProfile, id: 10 });

      renderProfile();

      await waitFor(() => {
        expect(screen.getByLabelText("Weekly minutes")).toBeInTheDocument();
      });

      await u.click(screen.getByRole("button", { name: "Create Profile" }));

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledTimes(1);
        expect(screen.getByText("Profile saved successfully!")).toBeInTheDocument();
      });
    });

    it("shows error message on failed create", async () => {
      const u = userEvent.setup();
      mockCreate.mockRejectedValue(new Error("fail"));

      renderProfile();

      await waitFor(() => {
        expect(screen.getByLabelText("Weekly minutes")).toBeInTheDocument();
      });

      await u.click(screen.getByRole("button", { name: "Create Profile" }));

      await waitFor(() => {
        expect(screen.getByText("Failed to save profile")).toBeInTheDocument();
      });
    });
  });

  describe("existing profile", () => {
    beforeEach(() => {
      mockGetByUserId.mockResolvedValue(existingProfile);
      mockGetGoals.mockResolvedValue(goals);
    });

    it("pre-fills form with existing profile data", async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByLabelText("Weekly minutes")).toHaveValue(120);
      });

      expect(screen.getByLabelText("Sessions per week")).toHaveValue(3);
      expect(screen.getByLabelText("Practice style")).toHaveValue("DYNAMIC");
      expect(screen.getByLabelText("Structure")).toHaveValue("STRUCTURED");
      expect(screen.getByLabelText("Philosophy")).toHaveValue("OPEN");
    });

    it("shows 'Update Profile' button", async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Update Profile" })).toBeInTheDocument();
      });
    });

    it("calls update on submit and shows success message", async () => {
      const u = userEvent.setup();
      mockUpdate.mockResolvedValue(existingProfile);

      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Update Profile" })).toBeInTheDocument();
      });

      await u.click(screen.getByRole("button", { name: "Update Profile" }));

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(screen.getByText("Profile saved successfully!")).toBeInTheDocument();
      });
    });
  });

  describe("goal toggling", () => {
    beforeEach(() => {
      mockGetByUserId.mockResolvedValue(null);
      mockGetGoals.mockResolvedValue(goals);
    });

    it("toggles goal checkbox on click", async () => {
      const u = userEvent.setup();
      renderProfile();

      await waitFor(() => {
        expect(screen.getByText("Physical Fitness")).toBeInTheDocument();
      });

      const checkbox = screen.getByRole("checkbox", { name: "Physical Fitness" });
      expect(checkbox).not.toBeChecked();

      await u.click(checkbox);
      expect(checkbox).toBeChecked();

      await u.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe("validation", () => {
    beforeEach(() => {
      mockGetByUserId.mockResolvedValue(null);
      mockGetGoals.mockResolvedValue(goals);
    });

    it("shows error when weekly minutes is below minimum", async () => {
      const u = userEvent.setup();
      renderProfile();

      await waitFor(() => {
        expect(screen.getByLabelText("Weekly minutes")).toBeInTheDocument();
      });

      const minutesInput = screen.getByLabelText("Weekly minutes");
      await u.clear(minutesInput);
      await u.type(minutesInput, "5");
      await u.click(screen.getByRole("button", { name: "Create Profile" }));

      await waitFor(() => {
        expect(screen.getByText("Min 15")).toBeInTheDocument();
      });
    });

    it("shows error when sessions per week exceeds maximum", async () => {
      const u = userEvent.setup();
      renderProfile();

      await waitFor(() => {
        expect(screen.getByLabelText("Sessions per week")).toBeInTheDocument();
      });

      const sessionsInput = screen.getByLabelText("Sessions per week");
      await u.clear(sessionsInput);
      await u.type(sessionsInput, "10");
      await u.click(screen.getByRole("button", { name: "Create Profile" }));

      await waitFor(() => {
        expect(screen.getByText("Max 7")).toBeInTheDocument();
      });
    });
  });
});
