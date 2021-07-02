import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Items, Openables } from 'oldschooljs';

import { customItems } from '../../lib/customItems';
import { maxMageGear, maxMeleeGear, maxRangeGear } from '../../lib/data/cox';
import { defaultGear, GearSetup } from '../../lib/gear';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Gear } from '../../lib/structures/Gear';
import { itemNameFromID } from '../../lib/util';
import { parseStringBank } from '../../lib/util/parseStringBank';

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

const openablesBank = new Bank();
for (const i of Openables.values()) {
	openablesBank.add(i.id, 100);
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[str:string]',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [str]: [string]) {
		if (this.client.production && msg.author.id !== '157797566833098752') {
			return;
		}

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

		if (msg.flagArgs.random) {
			let t = new Bank();
			for (let i = 0; i < 50; i++) {
				t.add(Items.random().id);
			}
			await msg.author.addItemsToBank(t);
			return msg.channel.send('Added 50 random items to your bank.');
		}

		if (msg.flagArgs.openables) {
			await msg.author.addItemsToBank(openablesBank);
			return msg.channel.send(
				`Gave you 100x of every openable item, which is: ${Openables.map(i => i.id)
					.map(itemNameFromID)
					.join(', ')}.`
			);
		}

		if (msg.flagArgs.customitems) {
			const b = new Bank();
			for (const item of customItems) {
				b.add(item);
			}
			await msg.author.addItemsToBank(b);
			return msg.channel.send(`Gave you: ${b}`);
		}

		const items = parseStringBank(str);
		const loot = new Bank();
		for (const [item, qty] of items) {
			loot.add(item.id, qty === 0 ? 1 : qty);
		}

		await msg.author.addItemsToBank(loot, Boolean(msg.flagArgs.cl));

		let res = `Gave you ${loot}.`;
		for (const setup of ['range', 'melee', 'mage', 'skilling'] as const) {
			if (msg.flagArgs[setup]) {
				let newGear: GearSetup = defaultGear;
				for (const [item] of items) {
					if (!item.equipable_by_player || !item.equipment) continue;
					newGear[item.equipment.slot] = { item: item.id, quantity: 1 };
				}
				await msg.author.settings.update(`gear.${setup}`, newGear);
				res += `\n\nEquipped these items: ${new Gear(newGear).toString()}`;
			}
		}

		return msg.send(res);
	}
}
