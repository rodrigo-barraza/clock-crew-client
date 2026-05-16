import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import NavBarComponent from "./NavBarComponent";

describe("NavBarComponent", () => {
  it("renders the navigation bar and links correctly", () => {
    render(<NavBarComponent />);
    (expect(screen.getByText("The Clock Crew")) as any).toBeInTheDocument();
    (expect(screen.getByRole("navigation")) as any).toBeInTheDocument();
    (expect(screen.getByText("Home")) as any).toBeInTheDocument();
    (expect(screen.getByText("Members")) as any).toBeInTheDocument();
    (expect(screen.getByText("History")) as any).toBeInTheDocument();
  });
});
