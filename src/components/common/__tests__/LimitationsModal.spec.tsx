import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LimitationsModal } from "../LimitationsModal";

const mockGetLimitations = jest.fn();

jest.mock("../../../api", () => ({
  referenceApi: {
    getLimitations: (...args: unknown[]) => mockGetLimitations(...args),
  },
}));

const mockOnClose = jest.fn();

const limitations = [
  { id: 1, name: "Asthma", description: "Respiratory condition", notes: "Avoid intense breathing exercises" },
  { id: 2, name: "Pregnancy", description: "Prenatal care needed", notes: "Modify poses as needed" },
];

describe("LimitationsModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state initially", () => {
    mockGetLimitations.mockReturnValue(new Promise(() => {}));

    render(<LimitationsModal onClose={mockOnClose} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders limitations in a table after loading", async () => {
    mockGetLimitations.mockResolvedValue(limitations);

    render(<LimitationsModal onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Asthma")).toBeInTheDocument();
    expect(screen.getByText("Respiratory condition")).toBeInTheDocument();
    expect(screen.getByText("Avoid intense breathing exercises")).toBeInTheDocument();
    expect(screen.getByText("Pregnancy")).toBeInTheDocument();
  });

  it("shows error message when API call fails", async () => {
    mockGetLimitations.mockRejectedValue(new Error("Network error"));

    render(<LimitationsModal onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load limitations")).toBeInTheDocument();
    });
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    mockGetLimitations.mockResolvedValue(limitations);

    render(<LimitationsModal onClose={mockOnClose} />);

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", async () => {
    const user = userEvent.setup();
    mockGetLimitations.mockResolvedValue(limitations);

    render(<LimitationsModal onClose={mockOnClose} />);

    await user.keyboard("{Escape}");

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when clicking inside the modal content", async () => {
    const user = userEvent.setup();
    mockGetLimitations.mockResolvedValue(limitations);

    render(<LimitationsModal onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText("Asthma")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Asthma"));

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("renders the modal header with title", async () => {
    mockGetLimitations.mockResolvedValue(limitations);

    render(<LimitationsModal onClose={mockOnClose} />);

    expect(screen.getByText("Limitations")).toBeInTheDocument();
  });
});
