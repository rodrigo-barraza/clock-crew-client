import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import NavBarComponent from "./NavBarComponent";

describe("NavBarComponent", () => {
  it("renders the navigation bar and links correctly", () => {
    render(<NavBarComponent />);
    expect(screen.getByText("The Clock Crew")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Members")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
  });
});
