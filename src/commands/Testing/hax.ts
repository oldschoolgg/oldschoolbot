import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { MAX_QP } from '../../lib/constants';
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
		msg.author.settings.update(UserSettings.QP, MAX_QP);
		msg.author.settings.update(UserSettings.Slayer.SlayerPoints, 100000);

		const loot: Record<string, number> = Object.fromEntries(Eatables.map(({ id }) => [id, 1000]));

		const bank = new Bank(loot);

		// Required and BiS items
		let itemsToAdd = new Set([
			'Zamorakian spear',
			'Dragon warhammer',
			'Bandos godsword',
			'Fighter hat',
			'Infernal cape',
			'Amulet of torture',
			'Holy blessing',
			'Ghrazi rapier',
			'Bandos chestplate',
			'Avernic defender',
			'Bandos tassets',
			'Ferocious gloves',
			'Boots of brimstone',
			'Treasonous ring (i)',
			'Warrior helm',
			'Blade of saeldor',
			'Primordial boots',
			'Warrior ring (i)',
			"Inquisitor's great helm",
			'Mythical cape',
			"Inquisitor's mace",
			"Inquisitor's hauberk",
			"Inquisitor's plateskirt",
			'Tyrannical ring (i)',
			'Armadyl helmet',
			"Ava's assembler",
			'Necklace of anguish',
			'Dragon bolts',
			'Armadyl crossbow',
			'Armadyl chestplate',
			'Twisted buckler',
			'Armadyl chainskirt',
			'Barrows gloves',
			'Pegasian boots',
			'Archers ring (i)',
			'Ancestral hat',
			'Imbued saradomin cape',
			'Occult necklace',
			'Kodai wand',
			'Ancestral robe top',
			'Arcane spirit shield',
			'Ancestral robe bottom',
			'Tormented bracelet',
			'Eternal boots',
			'Seers ring (i)',
			'Justiciar faceguard',
			'Amulet of fury',
			'Zamorakian hasta',
			'Justiciar chestguard',
			'Ancient wyvern shield',
			'Justiciar legguards',
			'Guardian boots',
			'Ring of suffering (i)',
			'Maple blackjack(d)',
			'Elysian spirit shield',
			'Crystal shield',
			'Crystal helm',
			'Master wand',
			'Spectral spirit shield',
			"Black d'hide vambraces",
			'Neitiznot faceguard',
			'Leaf-bladed battleaxe',
			'Berserker ring (i)',
			'Toktz-xil-ul',
			'Staff of the dead',
			'Saradomin mitre',
			'Soul cape',
			'Dragonbone necklace',
			'Void knight mace',
			'Proselyte hauberk',
			'Damaged book',
			'Proselyte cuisse',
			'Holy wraps',
			'Devout boots',
			'Ring of the gods (i)',
			'Armadyl godsword',
			'Toktz-mej-tal',
			'Crystal bow',
			'Elder maul',
			"Dinh's bulwark",
			'Dragon javelin',
			'Heavy ballista',
			'Twisted Bow',
			'Saradomin godsword',
			'Dragon arrow',
			"Inquisitor's great helm",
			'Mythical cape',
			'Amulet of torture',
			"Rada's blessing 4",
			'Abyssal bludgeon',
			"Inquisitor's hauberk",
			"Inquisitor's plateskirt",
			'Ferocious gloves',
			'Primordial boots',
			'Ring of suffering (i)',
			'Dragon claws',
			'Tormented bracelet'
		]);

		// Remove duplicates
		[...itemsToAdd].forEach(item => {
			bank.add(item);
		});

		const poh = await msg.author.getPOH();
		poh.pool = 29241;
		await poh.save();
		msg.author.addItemsToBank(bank.bank);
		return msg.send(
			`Gave you 99 in all skills, 1b GP, ${MAX_QP} QP, and 1k of all eatable foods and most BiS gear. **Gave your POH an ornate rejuve pool**`
		);
	}
}
