import { CommandStore, KlasaMessage } from 'klasa';

import { Emoji } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			aliases: ['bal', 'gp'],
			description: 'Shows how much virtual GP you own.',
			examples: ['+gp', '+bal'],
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
		const coins = msg.author.settings.get(UserSettings.GP);

		if (coins === 0) {
			return msg.send(
				`You have no GP yet ${Emoji.Sad} You can get some GP by using the ${msg.cmdPrefix}daily command.`
			);
		}

		return msg.channel.send(`${Emoji.MoneyBag} You have ${coins.toLocaleString()} GP!`);
	}
}
