import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { GearSetupTypes } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			cooldown: 1,
			usage: '<melee|mage|range|skilling|misc>',
			description: 'Shows your equipped gear.',
			examples: ['+gear melee', '+gear misc'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	async run(msg: KlasaMessage, [gearType]: [GearSetupTypes]) {
		const image = await generateGearImage(
			this.client,
			msg.author,
			msg.author.getGear(gearType),
			gearType,
			msg.author.settings.get(UserSettings.Minion.EquippedPet)
		);

		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}
}
