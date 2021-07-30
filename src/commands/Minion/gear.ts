import { MessageAttachment, MessageEmbed } from 'discord.js';
import { chunk } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { GearSetupType, GearSetupTypes } from '../../lib/gear';
import { generateAllGearImage, generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { makePaginatedMessage } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			cooldown: 1,
			usage: '[melee|mage|range|skilling|misc]',
			description: 'Shows your equipped gear.',
			examples: ['+gear melee', '+gear misc'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	async run(msg: KlasaMessage, [gearType]: [GearSetupTypes]) {
		const gear = msg.author.getGear(gearType);

		if (!gearType && !msg.flagArgs.all) {
			return msg.channel.send(
				'Invalid gear type. The valid types are: melee, mage, range, skilling or misc. You can use `--all` to show all your gear in a single image.'
			);
		}

		if (msg.flagArgs.text) {
			const textBank = [];

			if (msg.flagArgs.all) {
				for (const type of ['melee', 'range', 'mage', 'misc', 'skilling']) {
					const gear = msg.author.getGear(type as GearSetupType);
					for (const gearItem of Object.values(gear.raw())) {
						if (!gearItem) continue;
						textBank.push(`${getOSItem(gearItem.item).name}: ${gearItem.quantity.toLocaleString()}`);
					}
				}
			} else {
				for (const gearItem of Object.values(gear.raw())) {
					if (!gearItem) continue;
					textBank.push(`${getOSItem(gearItem.item).name}: ${gearItem.quantity.toLocaleString()}`);
				}
			}

			if (textBank.length === 0) {
				return msg.channel.send('No items found.');
			}

			const pages = [];
			for (const page of chunk(textBank, 12)) {
				pages.push({
					embeds: [
						new MessageEmbed()
							.setTitle(`${msg.author.username}'s ${gearType} gear`)
							.setDescription(page.join('\n'))
					]
				});
			}

			await makePaginatedMessage(msg, pages);

			return null;
		}

		if (msg.flagArgs.all) {
			return msg.channel.send({
				content: 'Here are all your gear setups',
				files: [new MessageAttachment(await generateAllGearImage(this.client, msg.author), 'osbot.png')]
			});
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
