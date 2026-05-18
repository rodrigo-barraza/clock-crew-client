import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HomePage from "./HomePage";

// Mock the NewgroundsPortalComponent as it relies on fetching APIs
vi.mock(
  "./components/NewgroundsPortalComponent/NewgroundsPortalComponent",
  () => ({
    default: () => <div data-testid="mock-ng-portal" />,
  }),
);

describe("HomePage", () => {
  it("renders the homepage correctly with mocked components", () => {
    render(<HomePage />);
    (expect(screen.getByText("The Clock Crew")) as any).toBeInTheDocument();
    (
      expect(screen.getByTestId("mock-discord-chat")) as any
    ).toBeInTheDocument();
    (expect(screen.getByTestId("mock-ng-portal")) as any).toBeInTheDocument();
  });
});
