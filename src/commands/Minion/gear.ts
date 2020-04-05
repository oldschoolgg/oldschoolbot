import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { GearTypes } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import resolveGearTypeSetting from '../../lib/gear/functions/resolveGearTypeSetting';
import { MessageAttachment } from 'discord.js';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<melee|mage|range|skilling|misc>'
		});
	}

	async run(msg: KlasaMessage, [gearType]: [GearTypes.GearSetupTypes]) {
		const image = await generateGearImage(
			this.client,
			msg.author.settings.get(resolveGearTypeSetting(gearType)),
			gearType
		);

		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}
}
