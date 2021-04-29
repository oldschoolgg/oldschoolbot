import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { Emoji } from '../../lib/constants';
import { maxMageGear, maxMeleeGear, maxRangeGear } from '../../lib/data/cox';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ItemBank } from '../../lib/types';

const gearSpawns = [
	{
		name: 'coxmage',
		gear: maxMageGear,
		setup: UserSettings.Gear.Mage
	},
	{
		name: 'coxmelee',
		gear: maxMeleeGear,
		setup: UserSettings.Gear.Melee
	},
	{
		name: 'coxrange',
		gear: maxRangeGear,
		setup: UserSettings.Gear.Range
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[qty:integer{1,1000000}] [item:...item]',
			usageDelim: ' ',
			oneAtTime: true,
			testingCommand: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage, [qty = 1, itemArray]: [number, Item[]]) {
		for (const i of gearSpawns) {
			if (msg.flagArgs[i.name]) {
				try {
					await msg.author.settings.update(i.setup, i.gear);
					return msg.channel.send(`Equipped you a premade setup called ${i.name}.`);
				} catch (err) {
					console.error(err);
				}
			}
		}

		if (!itemArray) return;

		if (msg.flagArgs.all) {
			const items: ItemBank = {};
			for (const item of itemArray) {
				items[item.id] = qty;
			}
			await msg.author.addItemsToBank(items);
			return msg.send(`Gave you ${new Bank(items)}.`);
		}

		const osItem = itemArray[0];
		await msg.author.addItemsToBank({ [osItem.id]: qty });

		for (const setup of ['range', 'melee', 'mage', 'skilling']) {
			if (msg.flagArgs[setup]) {
				try {
					await this.client.commands.get('equip')!.run(msg, [setup, 1, [osItem]]);
					return msg.send(`Equipped 1x ${osItem.name} to your ${setup} setup.`);
				} catch (err) {
					return msg.send(`Failed to equip item. Equip it yourself ${Emoji.PeepoNoob}`);
				}
			}
		}

		return msg.send(`Gave you ${qty}x ${osItem.name}.`);
	}
}
