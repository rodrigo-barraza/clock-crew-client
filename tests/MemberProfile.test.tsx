import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import MemberProfileComponent from "@/app/components/MemberProfileComponent/MemberProfileComponent";
import { memberData, ngProfile } from "./fixtures";

describe("MemberProfileComponent", () => {
  it("renders the summary as markdown, the signature as text, and link text", () => {
    render(<MemberProfileComponent data={memberData()} />);
    expect(screen.getByText("King").tagName).toBe("STRONG");
    expect(screen.getByText("[flash]b.swf[/flash]")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Spoony Bard" })).toHaveAttribute(
      "href",
      "http://www.clockcrew.net",
    );
    expect(screen.getByText("Joined Mar 22, 2000")).toBeInTheDocument();
  });

  it("names the reviewed submission instead of 'Unknown', on a 5-star scale", () => {
    render(<MemberProfileComponent data={memberData()} />);
    fireEvent.click(screen.getByRole("tab", { name: /Reviews/ }));
    expect(
      screen.getByRole("link", { name: "Cats Against Humanity" }),
    ).toHaveAttribute("href", "https://www.newgrounds.com/portal/view/892724");
    expect(screen.getByText("★ 5.0 / 5")).toBeInTheDocument();
  });

  it("shows Newgrounds BBS posts by their topic and link", () => {
    render(<MemberProfileComponent data={memberData()} />);
    fireEvent.click(screen.getByRole("tab", { name: /Posts/ }));
    expect(
      screen.getByRole("link", {
        name: "What does the Clock Crew do outside of Clock day?",
      }),
    ).toBeInTheDocument();
  });

  it("never puts a scraped javascript: URL into an href", () => {
    const data = memberData();
    data.member.newgrounds = {
      ...ngProfile,
      profileUrl: "javascript:alert(1)",
      links: [{ url: "javascript:alert(2)", text: "Trap" }],
    };
    render(<MemberProfileComponent data={data} />);
    expect(screen.getByText("Trap")).not.toHaveAttribute("href");
    expect(screen.queryByRole("link", { name: /Newgrounds/ })).toBeNull();
  });

  it("exposes its sections as tabs", () => {
    render(<MemberProfileComponent data={memberData()} />);
    const overview = screen.getByRole("tab", { name: /Overview/ });
    expect(overview).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute(
      "aria-labelledby",
      overview.id,
    );
  });
});
