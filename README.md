# LedgerMem Discord Bot

Discord bot for [LedgerMem](https://ledgermem.dev) — slash commands and reaction-based capture.

## Features

- `/remember text:<text>` — saves text as a memory
- `/recall query:<query>` — searches and replies with the top 3 hits as an ephemeral message
- `/forget id:<id>` — deletes a memory by id
- React with the eyeball emoji (👁️ by default) on any message to capture it as a memory

## Setup

1. Create an app at https://discord.com/developers/applications
2. Bot: enable **Message Content Intent** and **Server Members Intent**
3. OAuth2 → URL Generator: scopes `bot applications.commands`, permissions `Send Messages`, `Read Message History`, `Add Reactions`
4. Invite the bot to your server with the generated URL
5. Copy the **Bot Token** and **Application ID**

_Screenshots: `docs/discord-app-setup.png` (placeholder)_

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DISCORD_BOT_TOKEN` | yes | Bot token from the Developer Portal |
| `DISCORD_CLIENT_ID` | yes | Application (client) ID |
| `DISCORD_GUILD_ID` | no | Register commands to a single guild for instant updates (omit for global) |
| `LEDGERMEM_API_KEY` | yes | LedgerMem API key |
| `LEDGERMEM_WORKSPACE_ID` | yes | LedgerMem workspace ID |
| `CAPTURE_EMOJI` | no | Emoji that triggers capture (default `👁️`) |

## Run

```bash
cp .env.example .env
npm install
npm run register     # one-time: register slash commands with Discord
npm run dev
npm test
```

## Deploy

- **Docker:** `docker build -t ledgermem-discord-bot . && docker run --env-file .env ledgermem-discord-bot`
- **Fly.io / Railway / Render:** push the image; Discord bots are outbound-only (gateway WebSocket), no ports need to be exposed publicly
- **systemd unit on a small VPS:** the bot is a long-running process and is happy on a $5 box

## License

MIT
