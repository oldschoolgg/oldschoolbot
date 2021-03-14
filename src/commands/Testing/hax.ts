import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Eatables } from '../../lib/data/eatables';
import Potions from '../../lib/minions/data/potions';
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
		for (const potion of Potions) {
			bank.add(potion.items[3], 10000)
		}
		bank.add('Bandos boots');
		bank.add('Bandos tassets');
		bank.add('Bandos chestplate');
		bank.add('Bandos boots');
		bank.add('Ancestral hat');
		bank.add('Ancestral robe top');
		bank.add('Ancestral robe bottom');
		bank.add('Dragon arrow', 10000000);
		bank.add('Dragon bolts', 10000000);
		bank.add('Barrows gloves');
		bank.add('Ghrazi rapier');
		bank.add('Primordial boots');
		bank.add('Pegasian boots');
		bank.add('Armadyl crossbow');
		bank.add('Armadyl chestplate');
		bank.add('Armadyl chainskirt');
		bank.add('Armadyl helmet');
		bank.add("Ava's assembler", 3);
		bank.add('Infernal cape', 3);
		bank.add('Zamorakian spear');
		bank.add('Dragon warhammer');
		bank.add('Bandos godsword');
		bank.add('Amulet of fury', 5);
		bank.add('Brimstone ring', 3);
		bank.add('Archers ring');
		bank.add('Berserker ring');
		bank.add('Dragon defender');
		bank.add('Helm of neitiznot');
		bank.add('Book of law');
		bank.add('Kodai wand');
		bank.add('Arcane spirit shield');
		bank.add('Abyssal whip');
		bank.add("Inquisitor's mace");

		const poh = await msg.author.getPOH();
		poh.pool = 29241;
		await poh.save();
		msg.author.addItemsToBank(bank.bank);
		return msg.send(
			`Gave you 99 in all skills, 1b GP, 250 QP, and 1k of all eatable foods. **Gave your POH an ornate rejuve pool**`
		);
	}
}
