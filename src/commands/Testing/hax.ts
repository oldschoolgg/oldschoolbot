import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Eatables } from '../../lib/data/eatables';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skills from '../../lib/skilling/skills';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			oneAtTime: true,
			testingCommand: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage) {
		const paths = Object.values(Skills).map(sk => `skills.${sk.id}`);

		msg.author.settings.update(paths.map(path => [path, 14_000_000]));
		msg.author.settings.update(UserSettings.GP, 1_000_000_000);
		msg.author.settings.update(UserSettings.QP, 250);
		const loot: Record<string, number> = Object.fromEntries(
			Eatables.map(({ id }) => [id, 1000])
		);
		const bank = new Bank(loot);
		bank.add('Zamorakian spear');
		bank.add('Dragon warhammer');
		bank.add('Bandos godsword');
		const poh = await msg.author.getPOH();
		poh.pool = 29241;
		await poh.save();
		msg.author.addItemsToBank(bank.bank);

		if (msg.flagArgs.gora) {
			await msg.author.settings.update(UserSettings.Gear.Melee, {
				'2h': null,
				ammo: null,
				body: { item: 40034, quantity: 1 },
				cape: { item: 40022, quantity: 1 },
				feet: { item: 40037, quantity: 1 },
				hands: { item: 40036, quantity: 1 },
				head: { item: 40033, quantity: 1 },
				legs: { item: 40035, quantity: 1 },
				neck: null,
				ring: null,
				shield: null,
				weapon: null
			});
			await msg.author.settings.update(UserSettings.Gear.Range, {
				'2h': null,
				ammo: null,
				body: { item: 40048, quantity: 1 },
				cape: null,
				feet: { item: 40051, quantity: 1 },
				hands: { item: 40050, quantity: 1 },
				head: { item: 40047, quantity: 1 },
				legs: { item: 40049, quantity: 1 },
				neck: null,
				ring: null,
				shield: null,
				weapon: null
			});
			await msg.author.settings.update(UserSettings.Gear.Mage, {
				'2h': null,
				ammo: null,
				body: { item: 40043, quantity: 1 },
				cape: null,
				feet: { item: 40046, quantity: 1 },
				hands: { item: 40045, quantity: 1 },
				head: { item: 40042, quantity: 1 },
				legs: { item: 40044, quantity: 1 },
				neck: null,
				ring: null,
				shield: null,
				weapon: null
			});
		}
		return msg.send(
			`Gave you 99 in all skills, 1b GP, 250 QP, and 1k of all eatable foods. **Gave your POH an ornate rejuve pool**`
		);
	}
}
