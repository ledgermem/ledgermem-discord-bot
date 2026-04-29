export interface BotConfig {
  discordBotToken: string;
  discordClientId: string;
  discordGuildId?: string;
  getmnemoApiKey: string;
  getmnemoWorkspaceId: string;
  captureEmoji: string;
}

const REQUIRED = [
  "DISCORD_BOT_TOKEN",
  "DISCORD_CLIENT_ID",
  "GETMNEMO_API_KEY",
  "GETMNEMO_WORKSPACE_ID",
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
    getmnemoApiKey: process.env.GETMNEMO_API_KEY as string,
    getmnemoWorkspaceId: process.env.GETMNEMO_WORKSPACE_ID as string,
    captureEmoji: process.env.CAPTURE_EMOJI ?? "👁️",
  };
}
