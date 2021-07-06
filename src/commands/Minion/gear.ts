import { MessageAttachment, MessageEmbed } from 'discord.js';
import { chunk } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { GearSetupTypes } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import getOSItem from '../../lib/util/getOSItem';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			cooldown: 1,
			usage: '<melee|mage|range|skilling|misc|wildy>',
			description: 'Shows your equipped gear.',
			examples: ['+gear melee', '+gear misc'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	async run(msg: KlasaMessage, [gearType]: [GearSetupTypes]) {
		const gear = msg.author.getGear(gearType);

		if (msg.flagArgs.text) {
			const textBank = [];

			for (const gearItem of Object.values(gear.raw())) {
				if (!gearItem) continue;
				textBank.push(`${getOSItem(gearItem.item).name}: ${gearItem.quantity.toLocaleString()}`);
			}
			if (textBank.length === 0) {
				return msg.channel.send('No items found.');
			}

			const loadingMsg = await msg.channel.send({ embeds: [new MessageEmbed().setDescription('Loading...')] });
			const display = new UserRichDisplay();
			display.setFooterPrefix('Page ');

			for (const page of chunk(textBank, 12)) {
				display.addPage(
					new MessageEmbed()
						.setTitle(`${msg.author.username}'s ${gearType} gear`)
						.setDescription(page.join('\n'))
				);
			}

			await display.start(loadingMsg as KlasaMessage, msg.author.id, {
				jump: false,
				stop: false
			});
			return null;
		}

		const image = await generateGearImage(
			this.client,
			msg.author,
			gear,
			gearType,
			msg.author.settings.get(UserSettings.Minion.EquippedPet)
		);

		return msg.channel.send({ files: [new MessageAttachment(image, 'osbot.png')] });
	}
}
