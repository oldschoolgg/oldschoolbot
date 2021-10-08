import { CommandStore, KlasaMessage } from 'klasa';

import { getMinigameEntity } from '../../lib/settings/settings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			testingCommand: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage) {
		const minigameEntity = await getMinigameEntity(msg.author.id);
		minigameEntity.Inferno = 0;
		await minigameEntity.save();

		await msg.author.settings.reset(UserSettings.CollectionLogBank);
		await msg.author.settings.update(UserSettings.InfernoAttempts, 0);

		return msg.channel.send('Reset your inferno attempts, kc and collection log.');
	}
}
