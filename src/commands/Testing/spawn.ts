import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Items, Openables } from 'oldschooljs';

import { maxMageGear, maxMeleeGear, maxRangeGear } from '../../lib/data/cox';
import { GearSetupTypes } from '../../lib/gear';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Gear } from '../../lib/structures/Gear';
import { itemNameFromID, runCommand } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
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
	},
	{
		name: 'phosani',
		gear: new Gear({
			head: "Inquisitor's great helm",
			neck: 'Amulet of torture',
			body: "Inquisitor's hauberk",
			cape: 'Infernal cape',
			hands: 'Ferocious gloves',
			legs: "Inquisitor's plateskirt",
			feet: 'Primordial boots',
			ring: 'Berserker ring(i)',
			weapon: "Inquisitor's mace",
			shield: 'Dragon defender',
			ammo: "Rada's blessing 4"
		}),
		setup: UserSettings.Gear.Melee,
		otherItems: new Bank()
			.add('Super combat potion(4)', 1_000_000)
			.add('Sanfew serum(4)', 1_000_000)
			.add('Super restore(4)', 1_000_000)
			.add('Air rune', 1_000_000)
			.add('Fire rune', 1_000_000)
			.add('Wrath rune', 1_000_000)
			.add('Shark', 1_000_000)
			.add('Toxic blowpipe', 1)
			.add('Dragon dart', 1_000_000)
			.add("Zulrah's scales", 1_000_000)
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
			usage: '[str:...str]',
			usageDelim: ' ',
			oneAtTime: true,
			testingCommand: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage, [str]: [string | undefined]) {
		for (const i of gearSpawns) {
			if (msg.flagArgs[i.name]) {
				try {
					await msg.author.settings.update(i.setup, i.gear.raw());
					let str = '';
					str += `Equipped you a premade setup called ${i.name} which has: ${i.gear
						.allItems()
						.map(itemNameFromID)
						.join(', ')}.`;
					if (i.otherItems) {
						await msg.author.addItemsToBank(i.otherItems);
						str += `\n\n**Added to your bank:** ${i.otherItems}`;
					}
					return msg.channel.send(str);
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

		if (msg.flagArgs.id) {
			const item = getOSItem(Number(msg.flagArgs.id));
			await msg.author.addItemsToBank({ [item.id]: 1 });
			return msg.channel.send(`Gave you the item with the id of ${item.id} (${item.name})`);
		}

		const items = parseStringBank(str, undefined, true);

		const bank = new Bank();
		for (const [item, qty] of items) {
			bank.add(item.id, qty || 1);
		}
		await msg.author.addItemsToBank(bank, Boolean(msg.flagArgs.cl), false);

		for (const [item] of bank.items()) {
			for (const setup of GearSetupTypes) {
				if (msg.flagArgs[setup]) {
					if (!item.equipment) continue;
					try {
						await runCommand(msg, 'equip', [setup, 1, [item.name]]);
					} catch (err) {}
				}
			}
		}

		return msg.channel.send(`Gave you ${bank}.`);
	}
}
