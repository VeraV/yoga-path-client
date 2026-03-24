import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Register } from "../Register";
import { MemoryRouter } from "react-router-dom";

const mockRegister = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../context", () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}));

function renderRegister() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>,
  );
}

describe("Register Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders name, email, and password fields", () => {
    renderRegister();

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Register" }),
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
  });

  it("shows validation error for short name", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText("Name"), "A");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(
        screen.getByText("Name must be at least 2 characters"),
      ).toBeInTheDocument();
    });
  });

  it("shows validation error for short password", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText("Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "12345");
    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters"),
      ).toBeInTheDocument();
    });
  });

  it("calls register and navigates to dashboard on valid submit", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue(undefined);
    renderRegister();

    await user.type(screen.getByLabelText("Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows error message on failed registration", async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValue(new Error("fail"));
    renderRegister();

    await user.type(screen.getByLabelText("Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(
        screen.getByText("Registration failed. Email may already exist."),
      ).toBeInTheDocument();
    });
  });

  it("has a link to the login page", () => {
    renderRegister();

    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
