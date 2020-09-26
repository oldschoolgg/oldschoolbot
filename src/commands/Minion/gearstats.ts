import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import readableStatName from '../../lib/gear/functions/readableStatName';
import { GearSetupTypes } from '../../lib/gear/types';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			oneAtTime: true,
			usage: '<melee|range|mage>'
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
