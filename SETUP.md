# Setting up for contributing/running the bot

This assumes you are using VSCode as your IDE. If you have errors or issues, you can ask us for help in the #developer channel in the [discord server](https://discord.gg/ob).

## **Setup**

### Discord Bot Account

1. Create a discord bot account in the [Discord Developer Portal](https://discord.com/developers/applications).
   - Remember the **Application ID** & **Token**. Both are used later in **Configuration**.
   - If you don't save your Token you will have to reset it for a new one.
2. Ensure your bot has `Privileged Gateway Intents > Server Members Intent` enabled.

### Environment

1. Install [NvM](https://github.com/coreybutler/nvm-windows/), then use it to install NodeJS v20.15.0 OR install the nodejs version directly.
2. Install [Python](https://www.python.org/downloads/) used for multiple dependencies.
3. Install [Visual Studio Installer](https://visualstudio.microsoft.com/downloads/).
   - Install the `Community` version.
   - Once downloaded select and install `Workloads > Desktop development with C++`.
4. Install [Postgres 16](https://www.postgresql.org/download/) and **pgAdmin 4** for interacting with postgres (optional, but helpful).
   - Remember the **Port Number** and **Password**. Both are used later in **Configuration**.
5. Clone the repo: `git clone https://github.com/oldschoolgg/oldschoolbot.git`

### Configuration

1. Make a .env file from the example: `cp .env.example .env`
2. Edit this new `.env` file:
   - Put your test bot's **Application ID** into the `CLIENT_ID` field.
   - Put your test bot's **Token** into the `BOT_TOKEN` field.
   - Uncomment and enter the Server ID where you want to Administer your bot from into the`TESTING_SERVER_ID` field. (Skip if using official test server).
3. Create 2 databases called "osb_test" and "robochimp_test".
   - Using **pgAdmin 4** select `Servers > PostgreSQL > Databases > Create > Database...`.
   - Enter the database name into `Database` and hit `Save`.
4. Change `DATABASE_URL` and `ROBOCHIMP_DATABASE_URL` in your .env file with the format `postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME`.

### Finalizing Setup

1. Run the following commands in the root of the repo:
   - `corepack enable`
   - `pnpm i`
   - `npx prisma db push`
   - `npx prisma db push --schema ./robochimp.prisma`

### Commands

`pnpm dev`: Run this before pushing/PRing, or just at any time if you want, it does almost everything you need: Update deps, generate prisma clients, build, update files, lint and test.

`pnpm start`: Starts/runs your bot, and restarts it when you make changes.

`pnpm lint`: Run this if you only want to lint your code, and nothing else (pnpm dev runs this).

`pnpm test`: Run this if you only want to test your code, and nothing else (pnpm dev runs this).

`pnpm test:unit -u`: Updates all Vitest snapshot files. Run this if your changes intentionally update snapshot output.

`pnpm monorepo:build`: Run this if you have made changes to either monorepo (oldschooljs or toolkit) to update the dependency in the bot.

`pnpm monorepo:test`: Run this if you want to either monorepo (oldschooljs or toolkit).

#### VSCode settings (Optional)

1. In VSCode, press CTRL+SHIFT+P, search "Open User Settings JSON"
2. Add this to the file:

```json
  // Format/fix code automatically
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
  },
  // Disable telemetry
  "telemetry.telemetryLevel": "off",
  // Always use \n for EOF
  "files.eol": "\n",
```

# Troubleshooting

- Check your NodeJS/NPM/Pnpm/Postgres versions.
- Uninstall prettier/eslint vscode plugins.
- Delete these folders: node_modules, dist.
- Your IDE may need to be ran with admin privileges.
- "pnpm.psl cannot be loaded because running scripts is disabled on this sytem"
  - run this command in a terminal: `Set-ExecutionPolicy Unrestricted`
- If either of the `npx prisma` commands fail in **Finalizing Setup** you may need to manually create 2 databases called "osb_test" and "robochimp_test".
- Restarting your PC after **Environment** steps may be needed.
