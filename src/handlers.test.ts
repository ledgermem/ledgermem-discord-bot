import { describe, it, expect, vi } from "vitest";
import {
  handleRemember,
  handleRecall,
  handleForget,
  handleReactionCapture,
  type MemoryClient,
} from "./handlers.js";

function makeMemory(overrides: Partial<MemoryClient> = {}): MemoryClient {
  return {
    add: vi.fn().mockResolvedValue(undefined),
    search: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as MemoryClient;
}

describe("handleRemember", () => {
  it("rejects empty text", async () => {
    const m = makeMemory();
    const r = await handleRemember({
      text: "",
      channelId: "c",
      userId: "u",
      memory: m,
    });
    expect(r).toContain("Usage");
    expect(m.add).not.toHaveBeenCalled();
  });

  it("saves with discord metadata", async () => {
    const m = makeMemory();
    await handleRemember({
      text: "hello",
      channelId: "C1",
      userId: "U1",
      memory: m,
    });
    expect(m.add).toHaveBeenCalledWith("hello", {
      metadata: { source: "discord", threadId: "C1", userId: "U1" },
    });
  });
});

describe("handleRecall", () => {
  it("returns no-match string when empty", async () => {
    const m = makeMemory({ search: vi.fn().mockResolvedValue([]) });
    const r = await handleRecall({
      text: "q",
      channelId: "c",
      userId: "u",
      memory: m,
    });
    expect(r).toContain("No matches");
  });

  it("formats top hits", async () => {
    const m = makeMemory({
      search: vi.fn().mockResolvedValue([
        { id: "x", content: "alpha", score: 0.91 },
        { id: "y", content: "beta", score: 0.7 },
      ]),
    });
    const r = await handleRecall({
      text: "q",
      channelId: "c",
      userId: "u",
      memory: m,
    });
    expect(m.search).toHaveBeenCalledWith("q", { limit: 3 });
    expect(r).toContain("alpha");
    expect(r).toContain("id: x");
  });
});

describe("handleForget", () => {
  it("rejects empty id", async () => {
    const m = makeMemory();
    const r = await handleForget({
      text: "",
      channelId: "c",
      userId: "u",
      memory: m,
    });
    expect(r).toContain("Usage");
    expect(m.delete).not.toHaveBeenCalled();
  });

  it("calls delete with id", async () => {
    const m = makeMemory();
    await handleForget({
      text: "abc",
      channelId: "c",
      userId: "u",
      memory: m,
    });
    expect(m.delete).toHaveBeenCalledWith("abc");
  });
});

describe("handleReactionCapture", () => {
  it("ignores reactions that don't match capture emoji", async () => {
    const m = makeMemory();
    const r = await handleReactionCapture({
      emoji: "👍",
      captureEmoji: "👁️",
      messageContent: "hi",
      channelId: "c",
      userId: "u",
      messageId: "m",
      memory: m,
    });
    expect(r).toBeNull();
    expect(m.add).not.toHaveBeenCalled();
  });

  it("saves message content when capture emoji matches", async () => {
    const m = makeMemory();
    const r = await handleReactionCapture({
      emoji: "👁️",
      captureEmoji: "👁️",
      messageContent: "important",
      channelId: "c1",
      userId: "u1",
      messageId: "m1",
      memory: m,
    });
    expect(r).toContain("Saved");
    expect(m.add).toHaveBeenCalledWith("important", {
      metadata: {
        source: "discord-reaction",
        threadId: "c1",
        userId: "u1",
        messageId: "m1",
      },
    });
  });
});
