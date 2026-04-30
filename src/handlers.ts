import type { Mnemo } from "@mnemo/memory";

export interface MemoryClient {
  search: Mnemo["search"];
  add: Mnemo["add"];
  delete?: (id: string) => Promise<void>;
}

export interface SearchHit {
  id: string;
  content: string;
  score?: number;
}

export interface CommandContext {
  text: string;
  channelId: string;
  userId: string;
  memory: MemoryClient;
}

const TOP_K = 3;

export async function handleRemember(ctx: CommandContext): Promise<string> {
  const content = ctx.text.trim();
  if (!content) return "Usage: `/remember text:<text>`";
  await ctx.memory.add(content, {
    metadata: {
      source: "discord",
      threadId: ctx.channelId,
      userId: ctx.userId,
    },
  });
  return "Saved to memory.";
}

export async function handleRecall(ctx: CommandContext): Promise<string> {
  const query = ctx.text.trim();
  if (!query) return "Usage: `/recall query:<query>`";
  const hits = (await ctx.memory.search(query, { limit: TOP_K })) as SearchHit[];
  if (!hits || hits.length === 0) return `No matches found for **${query}**.`;
  const lines = hits.map(
    (h, i) =>
      `**${i + 1}.** ${h.content}${h.score !== undefined ? ` _(${h.score.toFixed(2)})_` : ""}\n  \`id: ${h.id}\``,
  );
  return `Top ${hits.length} matches for **${query}**:\n${lines.join("\n")}`;
}

export async function handleForget(ctx: CommandContext): Promise<string> {
  const id = ctx.text.trim();
  if (!id) return "Usage: `/forget id:<id>`";
  if (typeof ctx.memory.delete !== "function") {
    return "Delete is not supported by this Mnemo client version.";
  }
  await ctx.memory.delete(id);
  return `Forgot memory \`${id}\`.`;
}

export interface ReactionContext {
  emoji: string;
  captureEmoji: string;
  messageContent: string;
  channelId: string;
  userId: string;
  messageId: string;
  memory: MemoryClient;
}

export async function handleReactionCapture(
  ctx: ReactionContext,
): Promise<string | null> {
  if (ctx.emoji !== ctx.captureEmoji) return null;
  const content = ctx.messageContent.trim();
  if (!content) return null;
  await ctx.memory.add(content, {
    metadata: {
      source: "discord-reaction",
      threadId: ctx.channelId,
      userId: ctx.userId,
      messageId: ctx.messageId,
    },
  });
  return `Saved message ${ctx.messageId} to memory.`;
}
