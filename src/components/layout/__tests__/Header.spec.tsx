import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Header } from "../Header";

const mockLogout = jest.fn();
const mockUseAuth = jest.fn();

jest.mock("../../../context", () => ({
  useAuth: () => mockUseAuth(),
}));

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );
}

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when not authenticated", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        logout: mockLogout,
      });
    });

    it("shows Login and Register links", () => {
      renderHeader();

      expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
      expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute("href", "/register");
    });

    it("does not show authenticated navigation links", () => {
      renderHeader();

      expect(screen.queryByRole("link", { name: "Dashboard" })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Profile" })).not.toBeInTheDocument();
    });

    it("logo links to home page", () => {
      renderHeader();

      expect(screen.getByRole("link", { name: "Yoga Path" })).toHaveAttribute("href", "/");
    });
  });

  describe("when authenticated", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, name: "Test User", email: "test@example.com" },
        isAuthenticated: true,
        logout: mockLogout,
      });
    });

    it("shows navigation links for authenticated pages", () => {
      renderHeader();

      expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
      expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/profile");
      expect(screen.getByRole("link", { name: "Recommendations" })).toHaveAttribute("href", "/recommendations");
      expect(screen.getByRole("link", { name: "Practice Log" })).toHaveAttribute("href", "/practice-log");
    });

    it("does not show Login and Register links", () => {
      renderHeader();

      expect(screen.queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
    });

    it("shows greeting with user name", () => {
      renderHeader();

      expect(screen.getByText("Hello, Test User")).toBeInTheDocument();
    });

    it("logo links to dashboard", () => {
      renderHeader();

      expect(screen.getByRole("link", { name: "Yoga Path" })).toHaveAttribute("href", "/dashboard");
    });

    it("calls logout when logout button is clicked", async () => {
      const user = userEvent.setup();
      renderHeader();

      await user.click(screen.getByRole("button", { name: "Logout" }));

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe("mobile menu", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        logout: mockLogout,
      });
    });

    it("toggles menu open and closed on hamburger click", async () => {
      const user = userEvent.setup();
      renderHeader();

      const nav = screen.getByRole("navigation");
      expect(nav).not.toHaveClass("open");

      await user.click(screen.getByRole("button", { name: "Menu" }));
      expect(nav).toHaveClass("open");

      await user.click(screen.getByRole("button", { name: "Menu" }));
      expect(nav).not.toHaveClass("open");
    });
  });
});
