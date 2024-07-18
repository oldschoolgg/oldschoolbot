import { LootTable } from 'oldschooljs';
import type { Item } from 'oldschooljs/dist/meta/types';

import getOSItem from './util/getOSItem';

interface Crate {
	item: Item;
	key: Item;
	keyCostGP: number;
	table: LootTable;
}

export const keyCrates: Crate[] = [
	{
		item: getOSItem('Supply crate (s1)'),
		key: getOSItem('Supply crate key (s1)'),
		keyCostGP: 50_000_000,
		table: new LootTable()
			.add(new LootTable().add('OSB Jumper').add('BSO Jumper').add("Skipper's tie").add("Remy's chef hat"), 1, 2)
			.add('Paint box', 1, 7)
			.add('Archon headdress', 1, 5)
			.add('Archon tassets', 1, 5)
			.add('Archon crest', 1, 5)
			.add('Archon gloves', 1, 5)
			.add('Archon boots', 1, 5)
			.add('Coins', 100_000, 10)
			.add('Magic logs', [200, 300], 10)
			.add('Draconic visage', 1, 10)
			.add('Chocolate bar', 1, 10)
			.add('Baguette', 1, 10)
			.add('Kebab', 1, 10)
			.add('Spinach roll', 1, 6)
	},
	{
		item: getOSItem('Birthday crate (s2)'),
		key: getOSItem('Birthday crate key (s2)'),
		keyCostGP: 50_000_000,
		table: new LootTable()
			.oneIn(250, 'Golden cape shard')
			.add(
				new LootTable()
					.add('Cake partyhat')
					.add('Rubber flappy')
					.add('Shelldon shield')
					.add("Koschei's toothpick"),
				1,
				2
			)
			.add('Paint box', 1, 5)
			.add('Imperial helmet', 1, 5)
			.add('Imperial cuirass', 1, 5)
			.add('Imperial legs', 1, 5)
			.add('Imperial gloves', 1, 5)
			.add('Imperial sabatons', 1, 5)
			.add('Chocolate bomb', 1, 10)
			.add('Cake', 1, 11)
			.add('Chocolate cake', 1, 11)
			.add('Chocolate bar', 1, 10)
			.add('Peach', 1, 10)
			.add('Beer', 1, 10)
			.add('Birthday balloons', 1, 6)
	},
	{
		item: getOSItem('Spooky crate (s3)'),
		key: getOSItem('Spooky crate key (s3)'),
		keyCostGP: 20_000_000,
		table: new LootTable()
			.add(
				new LootTable()
					.add('Cob cap')
					.add('Pumpkin peepers')
					.add('Spooky sombrero')
					.add('Demonic halloween mask')
					.add('Spooky spider parasol'),
				1,
				3
			)
			.add('Spooky dye', 1, 2)
			.add(
				new LootTable()
					.add('Count Draynor torso')
					.add('Count Draynor bottoms')
					.add('Count Draynor cape')
					.add('Count Draynor hands')
					.add('Count Draynor shoes')
					.add('Count Draynor fangs'),
				1,
				5
			)
			.add('Bones', 1, 9)
			.add('Paint box', 1, 1)
			.add('Vial of blood', 1, 5)
			.add('Blood rune', [100, 200], 5)
			.add('Spooky spider parasol', 1, 4)
			.add('Voodoo doll', 1, 5)
			.add('Ghostweave', [100, 200], 29)
			.add('Pumpkin', [5, 15], 16)
			.add('Purple sweets', [1, 3], 16)
	},
	{
		item: getOSItem('Festive crate (s4)'),
		key: getOSItem('Festive crate key (s4)'),
		keyCostGP: 20_000_000,
		table: new LootTable()
			.add(
				new LootTable()
					.add('Christmas cape (classic)', 1, 1)
					.add('Christmas cape (rainbow)', 1, 2)
					.add('Christmas cape (snowy tree)', 1, 2)
					.add('Christmas cape (wintertodt blue)', 1, 2)
					.add('Festive partyhat')
			)
			.add('Christmas cape (rainbow)')
			.add('Christmas jumper (green)')
			.add('Christmas jumper (jolly red)')
			.add('Christmas jumper (frosty)')
			.add('Mistle-bow-tie')
			.add(new LootTable().add('Frosty parasol').add('Frosty wings').add('Frosty cape').add('Frosty staff'))
			.add(
				new LootTable()
					.add('Carrot')
					.add('Pavlova')
					.add('Prawns')
					.add('Pretzel')
					.add('Roast potatoes')
					.add('Gr-egg-oyle special')
					.add('Christmas pudding')
					.add('Yule log')
					.add("Dougs' chocolate mud")
					.add('Corn on the cob')
					.add('Roasted ham')
					.add('Pumpkinhead pie'),
				1,
				89
			)
	},
	{
		item: getOSItem('Easter crate (s5)'),
		key: getOSItem('Easter crate key (s5)'),
		keyCostGP: 10_000_000,
		table: new LootTable()
			.tertiary(5000, 'Golden bunny ears')
			.tertiary(750, new LootTable().add('Cute bunny cape').add('Bunny plushie'))
			.add(
				new LootTable()
					.add('Easter jumper')
					.add('Easter-egg delight')
					.add('Easter-egg salad')
					.add('Easter tunic')
					.add('Easter breeches')
					.add('Easter shoes'),
				1,
				1
			)
			.add(new LootTable().add('Carrot').add('Egg').add('Easter egg'), [2, 3], 99)
	},
	{
		item: getOSItem('Birthday crate (s6)'),
		key: getOSItem('Birthday crate key (s6)'),
		keyCostGP: 12_000_000,
		table: new LootTable()
			.tertiary(5000, 'Ethereal partyhat')
			.add(
				new LootTable()
					.add('Swan hat')
					.add('Swan scarf')
					.add('BSO banner')
					.add('Gambling skillcape')
					.add('Monkey cape')
					.add('BSO flowers')
					.add('Dice plushie')
					.add('Offhand dice plushie'),
				1,
				1
			)
			.add('Hoppy plushie')
			.add('Plopper nose')
			.add('Rose tinted glasses')
			.add('Blabberbeak jumper', 1, 1)
			.add('Paint box', 1, 2)
			.add(
				new LootTable()
					.add('Ceremonial hat')
					.add('Ceremonial cape')
					.add('Ceremonial boots')
					.add('Ceremonial legs')
					.add('Ceremonial top'),
				1,
				5
			)
			.add(
				new LootTable()
					.add('Raw plopper bacon')
					.add('Beer')
					.add('Birthday balloons')
					.add('Blueberry birthday cake')
					.add('Cake'),
				1,
				88
			)
	}
];
