import { SlashCommandBuilder } from "discord.js";

export const slashCommands = [
  new SlashCommandBuilder()
    .setName("remember")
    .setDescription("Save text as a memory")
    .addStringOption((o) =>
      o.setName("text").setDescription("Content to remember").setRequired(true),
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("recall")
    .setDescription("Search your memory")
    .addStringOption((o) =>
      o.setName("query").setDescription("Search query").setRequired(true),
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("forget")
    .setDescription("Delete a memory by id")
    .addStringOption((o) =>
      o.setName("id").setDescription("Memory id").setRequired(true),
    )
    .toJSON(),
];
