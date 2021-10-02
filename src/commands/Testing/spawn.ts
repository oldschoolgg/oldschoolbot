import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Items, Openables } from 'oldschooljs';

import { maxMageGear, maxMeleeGear, maxRangeGear } from '../../lib/data/cox';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemNameFromID } from '../../lib/util';
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

		if (msg.flagArgs.id) {
			const item = getOSItem(Number(msg.flagArgs.id));
			await msg.author.addItemsToBank({ [item.id]: 1 });
			return msg.channel.send(`Gave you the item with the id of ${item.id} (${item.name})`);
		}

		const items = parseStringBank(str, undefined, true);

		const bank = new Bank();
		for (const [item, qty] of items) {
			bank.add(item.id, qty ?? 1);
			for (const setup of ['range', 'melee', 'mage', 'skilling', 'wildy']) {
				if (msg.flagArgs[setup]) {
					try {
						await this.client.commands.get('equip')!.run(msg, [setup, 1, [item.name]]);
					} catch (err) {}
				}
			}
		}
		await msg.author.addItemsToBank(bank, Boolean(msg.flagArgs.cl), false);

		return msg.channel.send(`Gave you ${bank}.`);
	}
}
