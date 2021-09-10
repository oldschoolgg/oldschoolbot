import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Items, Openables } from 'oldschooljs';

import { customItems } from '../../lib/customItems';
import { maxMageGear, maxMeleeGear, maxRangeGear } from '../../lib/data/cox';
import { defaultGear, GearSetup } from '../../lib/gear';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Gear } from '../../lib/structures/Gear';
import { tameSpecies } from '../../lib/tames';
import { TameGrowthStage } from '../../lib/typeorm/TamesTable.entity';
import { itemNameFromID } from '../../lib/util';
import { parseStringBank } from '../../lib/util/parseStringBank';
import { generateNewTame } from '../bso/nursery';

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

		if (str === 'igne') {
			const tame = await generateNewTame(msg.author, tameSpecies[0]);
			return msg.channel.send(`Gave you a new tame: ${tame}.`);
		}

		if (str === 'monke') {
			const tame = await generateNewTame(msg.author, tameSpecies[1]);
			return msg.channel.send(`Gave you a new tame: ${tame}.`);
		}

		if (str === 'alltames') {
			let num = 0;
			for (const specie of tameSpecies) {
				for (const growth of [TameGrowthStage.Baby, TameGrowthStage.Juvenile, TameGrowthStage.Adult]) {
					for (const variation of [...specie.variants, specie.shinyVariant]) {
						const tame = await generateNewTame(msg.author, specie);
						tame.variant = variation;
						tame.growthStage = growth;
						await tame.save();
						num++;
					}
				}
			}
			return msg.channel.send(`Spawned you ${num} tames, 1 of every possible tame you can have.`);
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
			loot.add(item.id, qty === 0 ? 1 : Math.min(qty ?? 1, 1_000_000_000));
		}

		await msg.author.addItemsToBank(loot, Boolean(msg.flagArgs.cl), false);

		let res = `Gave you ${loot}.`;
		for (const setup of ['range', 'melee', 'mage', 'skilling', 'wildy'] as const) {
			if (msg.flagArgs[setup]) {
				let newGear: GearSetup = (msg.author.settings.get(`gear.${setup}`) as GearSetup) ?? { ...defaultGear };
				const returnToBank = new Bank();
				for (const [item] of items) {
					if (!item.equipable_by_player || !item.equipment) continue;
					if (newGear[item.equipment.slot] !== null) {
						returnToBank.add(newGear[item.equipment.slot]!.item, newGear[item.equipment.slot]!.quantity);
					}
					newGear[item.equipment.slot] = { item: item.id, quantity: 1 };
				}
				await msg.author.settings.update(`gear.${setup}`, newGear);
				await msg.author.addItemsToBank(returnToBank);
				res += `\n\nEquipped these items: ${new Gear(newGear).toString()}`;
			}
		}

		return msg.channel.send(res);
	}
}
