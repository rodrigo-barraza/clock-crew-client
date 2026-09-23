import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import WikiSidebarComponent from "@/app/components/WikiSidebarComponent/WikiSidebarComponent";

describe("WikiSidebarComponent", () => {
  it("starts closed on narrow screens and opens on request", () => {
    vi.mocked(usePathname).mockReturnValue("/history");
    render(<WikiSidebarComponent />);
    const toggle = screen.getByRole("button", { name: "Open wiki navigation" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(
      screen.getByRole("button", { name: "Close wiki navigation" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("offers A–Z jumps on the directory only, each switching to the A–Z sort", () => {
    vi.mocked(usePathname).mockReturnValue("/clocks");
    const { unmount } = render(<WikiSidebarComponent />);
    expect(screen.getByRole("link", { name: "A" })).toHaveAttribute(
      "href",
      "/clocks?sort=alpha#letter-A",
    );
    unmount();

    vi.mocked(usePathname).mockReturnValue("/clocks/StrawberryClock");
    render(<WikiSidebarComponent />);
    expect(screen.queryByRole("link", { name: "A" })).toBeNull();
  });
});
