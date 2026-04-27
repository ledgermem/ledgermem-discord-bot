export interface BotConfig {
  discordBotToken: string;
  discordClientId: string;
  discordGuildId?: string;
  ledgermemApiKey: string;
  ledgermemWorkspaceId: string;
  captureEmoji: string;
}

const REQUIRED = [
  "DISCORD_BOT_TOKEN",
  "DISCORD_CLIENT_ID",
  "LEDGERMEM_API_KEY",
  "LEDGERMEM_WORKSPACE_ID",
] as const;

export function loadConfig(): BotConfig {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
  return {
    discordBotToken: process.env.DISCORD_BOT_TOKEN as string,
    discordClientId: process.env.DISCORD_CLIENT_ID as string,
    discordGuildId: process.env.DISCORD_GUILD_ID,
    ledgermemApiKey: process.env.LEDGERMEM_API_KEY as string,
    ledgermemWorkspaceId: process.env.LEDGERMEM_WORKSPACE_ID as string,
    captureEmoji: process.env.CAPTURE_EMOJI ?? "👁️",
  };
}
