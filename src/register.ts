import "dotenv/config";
import { REST, Routes } from "discord.js";
import { loadConfig } from "./config.js";
import { slashCommands } from "./commands.js";

async function main(): Promise<void> {
  const cfg = loadConfig();
  const rest = new REST({ version: "10" }).setToken(cfg.discordBotToken);
  const route = cfg.discordGuildId
    ? Routes.applicationGuildCommands(cfg.discordClientId, cfg.discordGuildId)
    : Routes.applicationCommands(cfg.discordClientId);
  await rest.put(route, { body: slashCommands });
  // eslint-disable-next-line no-console
  console.log(
    `Registered ${slashCommands.length} commands ${cfg.discordGuildId ? `to guild ${cfg.discordGuildId}` : "globally"}.`,
  );
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
