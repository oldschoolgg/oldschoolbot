import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Emoji } from '../../lib/constants';
import { UserSettings } from '../../lib/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			description: 'Shows how much virtual QP you have.'
		});
	}

	async run(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
		const qp = msg.author.settings.get(UserSettings.QP);

		if (qp === 0) {
			throw `You have no QP yet ${Emoji.Sad} You can get some QP by using the ${msg.cmdPrefix}quest command.`;
		}

		return msg.channel.send(`${Emoji.MoneyBag} You have ${qp.toLocaleString()} QP!`);
	}
}
