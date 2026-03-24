import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Login } from "../Login";
import { MemoryRouter } from "react-router-dom";

const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../context", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
}

describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders email and password fields", () => {
    renderLogin();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("shows validation error when email is empty", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });
  });

  it("shows validation error when password is empty", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
  });

  it("shows validation error for short password", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "12345");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters"),
      ).toBeInTheDocument();
    });
  });

  it("calls login and navigates to dashboard on valid submit", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it('shows error message "Invalid email or password" on failed login', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new Error("fail"));
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(
        screen.getByText("Invalid email or password"),
      ).toBeInTheDocument();
    });
  });

  it("has a link to the register page", () => {
    renderLogin();

    expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute(
      "href",
      "/register",
    );
  });
});
