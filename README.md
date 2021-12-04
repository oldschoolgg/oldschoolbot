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

**To run the bot, you need the following things: Git, Yarn, NodeJS v12+, Postgres, a discord bot account**

1. Clone the repository: `git clone https://github.com/oldschoolgg/oldschoolbot.git`
2. Install the dependencies: `yarn`
3. Make a config file from the example: `cp src/config.example.ts src/config.ts`
4. Edit this new `config.ts` file, input your bot token and Postgres database details.
5. Go to https://discord.com/developers/applications and ensure your bot has `Privileged Gateway Intents > Server Members Intent` enabled.
6. Run `yarn build` - then run `yarn start`. In the future, you can type only `yarn start` to start the bot.

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

## Notes

1.  Old School Bot uses Klasa, a discord bot framework, if you have questions as to how Klasa works, or are interested in making your own Klasa bot, you can check it out [here](https://klasa.js.org/#/).

2.  The trivia questions/answers are not public in this repository, to prevent people from cheating. However, you can still submit some to be added. If you wish to submit some to be added, just ask me in the developer channel in our server. There are currently 260+ trivia questions.

## Self Hosting

Self hosting is not supported.
