import { describe, it, expect, vi } from "vitest";

// Mock heavy components to avoid deep dependency chains
vi.mock("@rodrigo-barraza/components-library", () => ({
  DiscordChatComponent: () => <div data-testid="discord-chat" />,
}));

vi.mock("@/app/components/NewgroundsPortalComponent/NewgroundsPortalComponent", () => ({
  default: () => <div data-testid="newgrounds-portal" />,
}));

vi.mock("@/app/components/ClockComponent/ClockComponent", () => ({
  default: () => <div data-testid="clock" />,
}));

describe("HomePage", () => {
  it("is importable", async () => {
    const mod = await import("@/app/HomePage");
    expect(mod.default).toBeTypeOf("function");
  });
});

describe("page.js metadata", () => {
  it("exports metadata with canonical", async () => {
    const mod = await import("@/app/page");
    expect(mod.metadata).toBeDefined();
    expect(mod.metadata.alternates.canonical).toBe("/");
  });
});
