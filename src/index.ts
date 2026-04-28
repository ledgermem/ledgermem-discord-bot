import "dotenv/config";
import {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  MessageFlags,
} from "discord.js";
import { LedgerMem } from "@ledgermem/memory";
import { loadConfig } from "./config.js";
import {
  handleRemember,
  handleRecall,
  handleForget,
  handleReactionCapture,
} from "./handlers.js";

async function main(): Promise<void> {
  const cfg = loadConfig();
  const memory = new LedgerMem({
    apiKey: cfg.ledgermemApiKey,
    workspaceId: cfg.ledgermemWorkspaceId,
  });

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  });

  client.once(Events.ClientReady, (c) => {
    // eslint-disable-next-line no-console
    console.log(`LedgerMem Discord bot ready as ${c.user.tag}`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    // Discord requires an ack within 3s. Memory ops can take longer than that,
    // so defer immediately and editReply once the work completes.
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    } catch (err) {
      console.error("deferReply failed:", err);
      return;
    }
    const ctx = {
      channelId: interaction.channelId ?? "dm",
      userId: interaction.user.id,
      memory,
    };
    let reply = "Unknown command.";
    try {
      switch (interaction.commandName) {
        case "remember":
          reply = await handleRemember({
            ...ctx,
            text: interaction.options.getString("text", true),
          });
          break;
        case "recall":
          reply = await handleRecall({
            ...ctx,
            text: interaction.options.getString("query", true),
          });
          break;
        case "forget":
          reply = await handleForget({
            ...ctx,
            text: interaction.options.getString("id", true),
          });
          break;
      }
    } catch (err) {
      // Don't echo raw error message — may leak internal hosts / tokens / PII.
      console.error("interaction handler failed:", err);
      reply = "Sorry, something went wrong handling that command.";
    }
    try {
      await interaction.editReply({ content: reply });
    } catch (err) {
      console.error("editReply failed:", err);
    }
  });

  // Dedup capture-emoji reactions so a single message is only ingested once
  // even if multiple users react or the same user toggles repeatedly.
  const reactionDedup = new Set<string>();
  const REACTION_DEDUP_MAX = 5000;

  client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (user.bot) return;
    try {
      if (reaction.partial) await reaction.fetch();
      if (reaction.message.partial) await reaction.message.fetch();
    } catch {
      return;
    }
    const emoji = reaction.emoji.name ?? "";
    if (emoji !== cfg.captureEmoji) return;
    const dedupKey = `${reaction.message.id}:${emoji}`;
    if (reactionDedup.has(dedupKey)) return;
    reactionDedup.add(dedupKey);
    if (reactionDedup.size > REACTION_DEDUP_MAX) {
      const oldest = reactionDedup.values().next().value;
      if (oldest) reactionDedup.delete(oldest);
    }
    const result = await handleReactionCapture({
      emoji,
      captureEmoji: cfg.captureEmoji,
      messageContent: reaction.message.content ?? "",
      channelId: reaction.message.channelId,
      userId: user.id,
      messageId: reaction.message.id,
      memory,
    });
    if (result) {
      try {
        const dm = await user.createDM();
        await dm.send(result);
      } catch {
        // user may have DMs disabled — silent ok
      }
    }
  });

  await client.login(cfg.discordBotToken);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal:", err);
  process.exit(1);
});
