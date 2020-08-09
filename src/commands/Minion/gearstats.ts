import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { GearSetupTypes } from '../../lib/gear/types';
import readableStatName from '../../lib/gear/functions/readableStatName';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			oneAtTime: true,
			usage: '<melee|range|magic>'
		});
	}

	async run(msg: KlasaMessage, [style]: [GearSetupTypes]) {
		const gearStats = msg.author.setupStats(style);
		return msg.send(
			Object.entries(gearStats).map(
				([name, value]) => `**${readableStatName(name)}:** ${value}`
			)
		);
	}
}
