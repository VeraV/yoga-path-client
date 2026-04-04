import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Home } from "../Home";

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

describe("Home", () => {
  it("'Get Started' links to register page", () => {
    renderHome();

    expect(screen.getByRole("link", { name: "Get Started" })).toHaveAttribute("href", "/register");
  });

  it("'Login' links to login page", () => {
    renderHome();

    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
  });

  it("displays the tagline", () => {
    renderHome();

    expect(screen.getByText("Your Personalized Practice Planner")).toBeInTheDocument();
  });
});
