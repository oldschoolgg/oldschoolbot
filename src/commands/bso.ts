import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows information about BSO',
			examples: ['+bso']
		});
	}

	async run(msg: KlasaMessage) {
		return msg.channel.send(
			'Bot School Old (BSO) is another version of the bot that you can play alongside this bot -' +
				' it\'s kind of like our "leagues", it has some fun changes, like 5x XP gain, custom bosses, custom items, stackable clue scrolls and more.' +
				'\n\n**Invite Link:** <https://oldschool.gg/invite/bso>\n' +
				'Read more here: <https://github.com/oldschoolgg/obdocs/blob/master/BSO.md>\n' +
				'and on the BSO Wiki: <https://bso-wiki.oldschool.gg/>'
		);
	}
}
