import { CommandStore, KlasaMessage } from 'klasa';

import { getMinigameEntity } from '../../lib/settings/settings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<kc:int{0,5000}>',
			usageDelim: ' ',
			testingCommand: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage, [kc]: [number]) {
		const entity = await getMinigameEntity(msg.author.id);
		if (!msg.flagArgs.cm) {
			entity.Raids = kc;
		}
		entity.RaidsChallengeMode = kc;
		await entity.save();

		return msg.send(`Set your raids and raids CM kc to ${kc}.`);
	}
}
