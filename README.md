[![Discord](https://i.imgur.com/AWqUL0x.png)](http://discord.gg/ob) [![Discord](https://i.imgur.com/OcOyprP.png)](https://invite.oldschool.gg/)

# ![Logo](https://i.imgur.com/VLvOEwo.png) Old School Bot

Old School Bot is a Discord Bot based on [Old School RuneScape](https://oldschool.runescape.com/)

For more information on the bot: https://www.oldschool.gg/oldschoolbot

> Old School Bot is not affiliated with or endorsed by Jagex. Play Old School RS for free at https://oldschool.runescape.com

## OldschoolJS

Old School Bot uses `oldschooljs` (also made by me), for most of the OSRS related features like: simulating killing monsters, simulating clues, fetching the hiscores, checking worlds, etc. It's completely open-source and free to use.

https://github.com/gc/oldschooljs

## Suggestions & Bug Reports

To report a bug, [click here](https://github.com/oldschoolgg/oldschoolbot/issues/new?labels=feature+request&template=bug.md).

To suggest a new feature, [click here](https://github.com/oldschoolgg/oldschoolbot/issues/new?labels=feature+request&template=feature.md)

## Contributing

Anyone is free to create PR's with improvements and additions to Old School Bot. If you have questions, ask in the `#developers` channel on our Discord server.

### Setting up the bot to run locally for contributing

#### **Setup**

1. Install [NvM](https://github.com/coreybutler/nvm-windows/), then use it to install NodeJS v20.15.0
2. Install [Postgres](https://www.postgresql.org/download/)
3. Install Yarn using: npm i -g yarn

#### **Setting up a Discord Bot**

1. Head to [Discord Developers](https://discord.com/developers) and create an application.
2. Once created, click into your Application.
3. Copy and store the Application ID, you'll need this later on.
4. Create a Bot on the Bot tab. Copy and store the token for your bot, you'll need this later on.
5. Ensure your bot has `Privileged Gateway Intents > Server Members Intent` enabled.
6. Invite your bot to your server via this URL. Be sure to input your `Application ID` into the URL. `https://discord.com/api/oauth2/authorize?client_id=<INSERT APPLICATION ID HERE>&permissions=2198754295617&scope=applications.commands%20bot`

#### **Setting up your environment**

1. Clone the repository: `git clone https://github.com/oldschoolgg/oldschoolbot.git`
2. Change into the new directory: `cd oldschoolbot`
3. Install the yarn dependency: `npm install --global yarn`
4. Make a config file from the example: `cp src/config.example.ts src/config.ts`
5. Edit this new `config.ts` file:
   1. Input your bot token you retrieved earlier into `botToken`
   2. Input your Application ID you retrieved earlier into `BotID`
   3. Copy your Discord ID into both `OWNER_IDS` and `ADMIN_IDS`. You can get your Discord ID by opening Settings, selecting My Account, selecting the three dots next to your user name and selecting Copy ID. You may need to enable Developer Mode in Advanced Settings to be given this option.
   4. Enter the Server ID where you want to Administer your bot from in `SupportServer`. You can get this by right clicking the logo of the server and selecting Copy ID.
   5. Enter the Server ID into `DEV_SERVER_ID`
6. Make a .env file copy from the example `cp .env.example .env`
7. Update this new `.env` file:
   1. Input your username, password, and schema names into `DATABASE_URL` and `ROBOCHIMP_DATABASE_URL` using the format `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
   2. Input your Application ID you retrieved earlier into `CLIENT_ID`
8. Run `yarn`
9. Run `npx prisma generate` to generate the Prisma client files and load the DSN from #6.
10. Run `npx prisma db push` to create the tables on the database referenced in .env
11. Run `npx prisma generate --schema=./prisma/robochimp.prisma` to generate the Prisma client files and load the DSN from #6 for the `robochimp` database.
12. Run `npx prisma db push --schema=./prisma/robochimp.prisma` to create the tables on the database referenced in .env for the `robochimp` database.
13. Run `yarn build` - then run `yarn start`. In the future, you can type only `yarn start` to start the bot.

If you have errors or issues, you can ask us for help in the #developer channel in the [discord server](https://discord.gg/ob).

#### **Shared Testing Server**

In addition to being able your develop on your own server as we have done above, there is a shared dev server which can be joined here: [https://discord.gg/Cup2gwUGwr](https://discord.gg/Cup2gwUGwr)

You can also ask Magna to invite your Bot with your invite link above if you so wish.

### Contributors

- [[Ciaran](https://github.com/ciaranlangton)]
- [[Devin](https://github.com/devin8)]
- [[ms813](https://github.com/ms813)]
- [[Alexsuperfly](alexsuperfly)]
- [[Umdlye](https://github.com/umdlye)]
- [[Kyra](https://github.com/kyranet)]
- [[Wyatt](https://github.com/wyattos)]
- [[coolbop32](https://github.com/coolbop32)]
- [[duracell33](https://github.com/duracell33)]
- [[themrrobert](https://github.com/themrrobert)]
- [[Fishy](https://github.com/Lajnux)]
- [[Lilylicious](https://github.com/Lilylicious)]
- [[Gidedin](https://github.com/imgidedin)]
- [[Andre](https://github.com/ard35)]
- [[TastyPumPum](https://github.com/TastyPumPum)]

## Self Hosting

Self hosting is not supported.

## Notes

### Profiling tests

- node --cpu-prof --cpu-prof-dir=./profiling ./node_modules/vitest/vitest.mjs run --coverage --config vitest.unit.config.mts parseStringBank

## Module graph

- yarn build && npx madge --image graph2.svg ./dist/index.js
