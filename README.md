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

Anyone is free to create PR's with improvements and additions to Old School Bot.

Please lint your code with the projects' [ESLint](https://eslint.org/) config.

Contributors are listed in this file, and given a Contributor role in the support server. If you have more questions, send me a message on discord.

### Setting up the bot to run locally for contributing

**To run the bot, you need the following things first: Git, NodeJS v12+, Postgres, a discord bot account**

1. Clone the repository: `git clone https://github.com/oldschoolgg/oldschoolbot.git`
2. Change into the new directory: `cd oldschoolbot`
3. Install the yarn dependency: `npm install --global yarn`
4. Make a config file from the example: `cp src/config.example.ts src/config.ts`
5. Edit this new `config.ts` file, input your bot token and Postgres database details; be sure to read the comments for any additional instructions.
6. Go to https://discord.com/developers/applications and ensure your bot has `Privileged Gateway Intents > Server Members Intent` enabled.
7. Create a file called `.env` in your project's root directory with the content
   (change as necessary for your DB, this is known as a DSN): `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres?schema=public`
8. Run `yarn` then `yarn install`
8. Run `npx prisma generate` to generate the Prisma client files and load the DSN from #6
9. Run `npx prisma db push` to create the tables on the database referenced in .env
10. Run `yarn build` - then run `yarn start`. In the future, you can type only `yarn start` to start the bot.

If you have errors or issues, you can ask us for help in the developer channel in the [discord server](https://discord.gg/ob).

### Contributors

-   [[Ciaran](https://github.com/ciaranlangton)]
-   [[Devin](https://github.com/devin8)]
-   [[ms813](https://github.com/ms813)]
-   [[Alexsuperfly](alexsuperfly)]
-   [[Umdlye](https://github.com/umdlye)]
-   [[Kyra](https://github.com/kyranet)]
-   [[Wyatt](https://github.com/wyattos)]
-   [[coolbop32](https://github.com/coolbop32)]
-   [[duracell33](https://github.com/duracell33)]
-   [[themrrobert](https://github.com/themrrobert)]
-   [[Fishy](https://github.com/Lajnux)]
-   [[Lilylicious](https://github.com/Lilylicious)]
-   [[Gidedin](https://github.com/imgidedin)]
-   [[Andre](https://github.com/ard35)]
-   [[TastyPumPum](https://github.com/TastyPumPum)]

## Self Hosting

Self hosting is not supported.
