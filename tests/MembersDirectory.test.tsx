import { describe, it, expect } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import MembersDirectory from "@/app/(wiki)/clocks/MembersDirectory";
import type { DirectoryUser } from "@/types";

const users: DirectoryUser[] = [
  {
    userId: 3,
    username: "StrawberryClock",
    postCount: 18,
    dateRegistered: "2000-03-22T15:00:00.000Z",
  },
  {
    userId: 201,
    username: "Slurpee",
    postCount: 12994,
    dateRegistered: "2003-03-09T18:59:00.000Z",
    customTitle: "xylophone",
  },
  {
    userId: 9,
    username: "_underscore",
    postCount: 5,
    dateRegistered: "2010-01-01T00:00:00.000Z",
  },
];

describe("MembersDirectory", () => {
  it("renders every member, most posts first", () => {
    render(<MembersDirectory users={users} initialSort="posts" />);
    expect(
      screen.getByText("3 Clock Crew members archived"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link").map((link) => link.getAttribute("href")),
    ).toEqual([
      "/clocks/Slurpee",
      "/clocks/StrawberryClock",
      "/clocks/_underscore",
    ]);
  });

  it("groups by letter with anchor ids the sidebar links to, # last", () => {
    render(<MembersDirectory users={users} initialSort="alpha" />);
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.map((heading) => heading.id)).toEqual([
      "letter-S",
      "letter-#",
    ]);
  });

  it("filters by name or title and keeps the sort in the URL", () => {
    render(<MembersDirectory users={users} initialSort="posts" />);
    fireEvent.change(screen.getByPlaceholderText("Search members…"), {
      target: { value: "xylo" },
    });
    expect(screen.getAllByRole("link")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Newest" }));
    expect(window.location.search).toBe("?sort=newest");
    expect(screen.getByRole("button", { name: "Newest" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("says so when the directory could not be loaded", () => {
    render(<MembersDirectory users={null} initialSort="posts" />);
    expect(
      screen.getByText("The member directory is unavailable right now."),
    ).toBeInTheDocument();
    expect(within(document.body).queryAllByRole("link")).toHaveLength(0);
  });
});
