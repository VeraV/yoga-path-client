import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PrivateRoute } from "../PrivateRoute";

const mockUseAuth = jest.fn();

jest.mock("../../../context", () => ({
  useAuth: () => mockUseAuth(),
}));

function renderWithRouter(initialRoute: string = "/protected") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PrivateRoute", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading spinner while auth is being checked", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    renderWithRouter();

    expect(screen.getByText("Checking authentication...")).toBeInTheDocument();
  });

  it("renders child routes when authenticated", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithRouter();

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to /login when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithRouter();

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
