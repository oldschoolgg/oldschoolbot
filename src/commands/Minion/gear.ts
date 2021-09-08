import { MessageAttachment, MessageEmbed } from 'discord.js';
import { chunk } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { GearSetupType, GearSetupTypes, resolveGearTypeSetting } from '../../lib/gear';
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
			usage: '[swap] [melee|mage|range|skilling|misc|wildy] [melee|mage|range|skilling|misc|wildy]',
			usageDelim: ' ',
			subcommands: true,
			aliases: ['gearall', 'gall'],
			description: 'Shows your equipped gear.',
			examples: ['+gear melee', '+gear misc'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	async swap(msg: KlasaMessage, [gear1, gear2]: [GearSetupTypes, GearSetupTypes]) {
		if (msg.commandText !== 'gear') return this.run(msg, [gear1]);
		if (!gear1 || !gear2) {
			return msg.channel.send(
				`**Invalid gear type**. The valid types are: \`melee\`, \`mage\`, \`range\`, \`misc\`, \`skilling\` or \`wildy\`.\nExample of correct usage: \`${msg.cmdPrefix}gear swap melee range\``
			);
		}
		if (gear1 === GearSetupTypes.Wildy || gear2 === GearSetupTypes.Wildy) {
			await msg.confirm(
				'Are you sure you want to swap your gear with a wilderness setup? You can lose items on your wilderness setup!'
			);
			msg.flagArgs.cf = '1';
		}

		const _gear1 = msg.author.getGear(gear1);
		const _gear1Type = resolveGearTypeSetting(gear1);
		const _gear2 = msg.author.getGear(gear2);
		const _gear2Type = resolveGearTypeSetting(gear2);

		await msg.author.settings.update(_gear1Type, _gear2);
		await msg.author.settings.update(_gear2Type, _gear1);

		return msg.channel.send(`You swapped your ${gear1} gear with your ${gear2} gear.`);
	}

	async run(msg: KlasaMessage, [gearType]: [GearSetupTypes]) {
		const gear = msg.author.getGear(gearType);
		if (['gearall', 'gall'].includes(msg.commandText!)) msg.flagArgs.all = 'yes';

		if (!gearType && !msg.flagArgs.all) {
			return msg.channel.send(
				`**Invalid gear type**. The valid types are: \`melee\`, \`mage\`, \`range\`, \`misc\`, \`skilling\` or \`wildy\`.\nYou can use \`--all\` or \`${msg.cmdPrefix}gearall\` to show all your gear in a single image.`
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
