import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { GearTypes } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { BotCommand } from '../../lib/structures/BotCommand';
import getOSItem from '../../lib/util/getOSItem';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			cooldown: 1,
			usage: '<items:...str>',
			usageDelim: ',',
			description: 'Shows stats for a set of gear.',
			examples: ['+gearstats dragon full helm, dragon boots'],
			categoryFlags: ['minion', 'utility']
		});
	}

	async run(msg: KlasaMessage, [itemNames]: [string]) {
		const gear: GearTypes.GearSetup = {
			'2h': null,
			ammo: null,
			body: null,
			cape: null,
			feet: null,
			hands: null,
			head: null,
			legs: null,
			neck: null,
			ring: null,
			shield: null,
			weapon: null
		};
		for (const name of itemNames.split(',')) {
			const item = getOSItem(name);
			if (item.equipment) {
				gear[item.equipment.slot] = { item: item.id, quantity: 1 };
			}
		}
		const image = await generateGearImage(this.client, msg.author, gear, null, null);
		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}
}
