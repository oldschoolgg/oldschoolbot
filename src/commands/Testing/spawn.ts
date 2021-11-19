import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Items, Openables } from 'oldschooljs';

import { maxMageGear, maxMeleeGear, maxRangeGear } from '../../lib/data/cox';
import { GearSetupTypes } from '../../lib/gear';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { tameSpecies } from '../../lib/tames';
import { TameGrowthStage } from '../../lib/typeorm/TamesTable.entity';
import { itemNameFromID, runCommand } from '../../lib/util';
import { parseStringBank } from '../../lib/util/parseStringBank';
import { generateNewTame } from '../bso/nursery';
import { phosaniBISGear } from '../Minion/nightmare';

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
		gear: phosaniBISGear,
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

		if (msg.flagArgs.tames) {
			for (const tame of tameSpecies) {
				const t = await generateNewTame(msg.author, tame);
				t.growthStage = TameGrowthStage.Adult;
				await t.save();
			}
			return msg.channel.send('Gave you 1 of every tame.');
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
