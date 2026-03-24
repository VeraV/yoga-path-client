import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import { authApi } from "../../api/authApi";

jest.mock("../../api/authApi", () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    verify: jest.fn(),
  },
}));

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;

function TestConsumer() {
  const { user, isAuthenticated, isLoading, login, register, logout } =
    useAuth();

  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user ? user.name : "null"}</span>
      <button
        onClick={() => login({ email: "test@example.com", password: "123456" })}
      >
        Login
      </button>
      <button
        onClick={() =>
          register({
            name: "Test",
            email: "test@example.com",
            password: "123456",
          })
        }
      >
        Register
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("starts unauthenticated with no user when no token exists", async () => {
      mockedAuthApi.verify.mockRejectedValue(new Error("no token"));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      expect(screen.getByTestId("authenticated").textContent).toBe("false");
      expect(screen.getByTestId("user").textContent).toBe("null");
    });
  });

  describe("token verification on mount", () => {
    it("restores user session when valid token exists", async () => {
      localStorage.setItem("token", "valid-token");
      mockedAuthApi.verify.mockResolvedValue({
        id: 1,
        name: "Test User",
        email: "test@example.com",
        enabled: true,
        createdAt: "2026-01-01T00:00:00",
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      expect(screen.getByTestId("authenticated").textContent).toBe("true");
      expect(screen.getByTestId("user").textContent).toBe("Test User");
    });

    it("clears token and stays unauthenticated when token is invalid", async () => {
      localStorage.setItem("token", "invalid-token");
      mockedAuthApi.verify.mockRejectedValue(new Error("invalid"));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      expect(screen.getByTestId("authenticated").textContent).toBe("false");
      expect(localStorage.getItem("token")).toBeNull();
    });
  });

  describe("login", () => {
    it("stores token and sets user state on successful login", async () => {
      mockedAuthApi.verify.mockRejectedValue(new Error("no token"));
      mockedAuthApi.login.mockResolvedValue({
        token: "new-token",
        userId: 1,
        email: "test@example.com",
        name: "Test User",
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      await act(async () => {
        screen.getByText("Login").click();
      });

      expect(localStorage.getItem("token")).toBe("new-token");
      expect(screen.getByTestId("authenticated").textContent).toBe("true");
      expect(screen.getByTestId("user").textContent).toBe("Test User");
    });
  });

  describe("register", () => {
    it("stores token and sets user state on successful registration", async () => {
      mockedAuthApi.verify.mockRejectedValue(new Error("no token"));
      mockedAuthApi.register.mockResolvedValue({
        token: "new-token",
        userId: 1,
        email: "test@example.com",
        name: "Test",
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      await act(async () => {
        screen.getByText("Register").click();
      });

      expect(localStorage.getItem("token")).toBe("new-token");
      expect(screen.getByTestId("authenticated").textContent).toBe("true");
      expect(screen.getByTestId("user").textContent).toBe("Test");
    });
  });

  describe("logout", () => {
    it("clears token and sets user to null", async () => {
      localStorage.setItem("token", "valid-token");
      mockedAuthApi.verify.mockResolvedValue({
        id: 1,
        name: "Test User",
        email: "test@example.com",
        enabled: true,
        createdAt: "2026-01-01T00:00:00",
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("authenticated").textContent).toBe("true");
      });

      await act(async () => {
        screen.getByText("Logout").click();
      });

      expect(localStorage.getItem("token")).toBeNull();
      expect(screen.getByTestId("authenticated").textContent).toBe("false");
      expect(screen.getByTestId("user").textContent).toBe("null");
    });
  });

  describe("useAuth hook", () => {
    it("throws error when used outside AuthProvider", () => {
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      expect(() => render(<TestConsumer />)).toThrow(
        "useAuth must be used within an AuthProvider",
      );

      spy.mockRestore();
    });
  });
});
