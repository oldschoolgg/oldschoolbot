import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { GearSetupTypes } from '../../lib/gear/types';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			oneAtTime: true,
			usage: '<melee|range|magic>'
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage, [style]: [GearSetupTypes]) {
		const gearStats = msg.author.setupStats(style);
		return msg.send(JSON.stringify(gearStats, null, 4));
	}
}
