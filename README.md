[![Discord](https://i.imgur.com/AWqUL0x.png)](http://discord.gg/ob) [![Discord](https://i.imgur.com/OcOyprP.png)](https://www.oldschool.gg/commands)

# ![Logo](https://i.imgur.com/VLvOEwo.png) Old School Bot

Old School Bot is a Discord Bot based on [Old School RuneScape](https://oldschool.runescape.com/)

Commands: https://www.oldschool.gg/commands

> Old School Bot is not affiliated with or endorsed by Jagex. Play Old School RS for free at https://oldschool.runescape.com

## Suggestions & Bug Reports

If you'd like to make a suggestion, or a bug report, simply [create a new issue](https://github.com/gc/oldschoolbot/issues/new).

## Contributing

Anyone is free to create PR's with improvements and additions to Old School Bot.

Please lint your code with the projects' [ESLint](https://eslint.org/) config.

Contributors are listed in this file, and given a Contributor role in the support server. If you have more questions, send me a message on discord.

### Setting up the bot to run locally for contributing

1. Clone the repository: `git clone https://github.com/gc/oldschoolbot.git`
2. Go into the folder, and
   `yarn install`
3. Make a file called `private.js` in the `/config` folder with this content, filling in your bot token:

```js
module.exports = {
	token: `YOUR_BOT_TOKEN_HERE`
};
```

4. Run `node bot`

### Contributors

-   [[Ciaran](https://github.com/ciaranlangton)] helping with the quest command
-   [[Devin](https://github.com/devin8)] adding lots of bosses and monsters to +finish command
-   [[ms813](https://github.com/ms813)] adding the "raids" command
-   [[Alexsuperfly](alexsuperfly)] various command improvements
-   [[Umdlye](https://github.com/umdlye)] various fixes and improvements
-   [[Kyra](https://github.com/kyranet)] helping with many things, function for scraping world list

## Notes

1.  Old School Bot uses Klasa, a discord bot framework, if you have questions as to how Klasa works, or are interested in making your own Klasa bot, you can check it out [here](https://klasa.js.org/#/).

2.  The trivia questions/answers are not public in this repository, to prevent people from cheating. However, you can still submit some to be added by adding them to [this file](https://github.com/gc/oldschoolbot/blob/master/data/trivia-questions-format.json), where I'll merge your additions into the real file, and then remove them from the sample file. Alternatively, you can manually send them to me to be added. There are currently 260+ trivia questions.

## Self Hosting

Self hosting is not supported.
