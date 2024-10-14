# Setting up for contributing/running the bot

This assumes you are using VSCode as your IDE. If you have errors or issues, you can ask us for help in the #developer channel in the [discord server](https://discord.gg/ob).

## **Setup**

### Discord Bot Account

1. Create a discord bot account, and have the application ID and bot token saved.
2. Ensure your bot has `Privileged Gateway Intents > Server Members Intent` enabled.

### Environment

1. Install [NvM](https://github.com/coreybutler/nvm-windows/), then use it to install NodeJS v20.15.0 OR install the nodejs version directly.
2. Install [Postgres 16](https://www.postgresql.org/download/) and PGAdmin4 for interacting with postgres (optional, but helpful)
   - Remember the port number and password you use. These are used later in the configuration steps.
3. Install Yarn using: `npm i -g yarn`
4. Clone the repo: `git clone https://github.com/oldschoolgg/oldschoolbot.git`

### Configuration

1. Copy the ".env.example" file and rename the copy to ".env", put your bot token and bot id (client id) in it.
   - If not using the official test server: Uncomment and enter your Server ID into `TESTING_SERVER_ID`
2. Create 2 databases called "osb_test" and "robochimp_test"
3. Change `DATABASE_URL` and `ROBOCHIMP_DATABASE_URL` in your .env with the format `postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME`.
4. Make a config file from the example: `cp src/config.example.ts src/config.ts`
5. Edit this new `config.ts` file:
   - Copy your Discord ID into both `OWNER_IDS` and `ADMIN_IDS`.
   - Enter the Server ID where you want to Administer your bot from in `SupportServer`

### Finalizing Setup

1. Run the following commands in the root of the repo:
   - `corepack enable`
   - `yarn`
   - `npx prisma db push`
   - `npx prisma db push --schema ./prisma/robochimp.prisma`

### Running the bot

1. Run `yarn start` or `yarn watch`

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

- Check your NodeJS/NPM/Yarn/Postgres versions.
- Uninstall prettier/eslint vscode plugins.
- Delete these folders: node_modules, dist.
- Your IDE may need to be ran with admin privileges.
- Installing python may be needed if you see errors with dependencies.
