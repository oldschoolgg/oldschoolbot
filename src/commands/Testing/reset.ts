import { CommandStore, KlasaMessage } from 'klasa';

import { getNewUser } from '../../lib/settings/settings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { SlayerTaskTable } from '../../lib/typeorm/SlayerTaskTable.entity';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			testingCommand: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage) {
		await SlayerTaskTable.delete({ user: await getNewUser(msg.author.id) });
		await msg.author.settings.reset();
		await msg.author.settings.update('minion.hasBought', true);
		return msg.channel.send('Resetteded all your data.');
	}
}
