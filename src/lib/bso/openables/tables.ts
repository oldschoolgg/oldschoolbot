import { RuneTable } from '@/lib/bso/tables/seedTable.js';
import { ExoticSeedsTable } from '@/lib/bso/tables/sharedTables.js';
import { LampTable } from '@/lib/bso/xpLamps.js';

import { LootTable, TreeHerbSeedTable } from 'oldschooljs';

export const MysteryBoxes = new LootTable()
	.oneIn(55, 'Pet Mystery Box')
	.oneIn(165, 'Holiday Mystery Box')
	.oneIn(35, 'Equippable mystery box')
	.oneIn(35, 'Clothing Mystery Box')
	.add('Tradeable Mystery Box')
	.add('Untradeable Mystery Box');

export const NestBoxes = new LootTable()
	.add('Nest box (seeds)', 1, 12)
	.add('Nest box (ring)', 1, 5)
	.add('Nest box (empty)', 1, 3);

const baseTGBTable = new LootTable()
	.add('Tradeable mystery box', [1, 3])
	.add('Reward casket (master)', [3, 6])
	.add('Reward casket (beginner)', [3, 9])
	.add('Reward casket (hard)', [3, 7])
	.add('Dwarven crate', 2)
	.add(NestBoxes, 100)
	.add('Holiday Mystery box')
	.add('Pet Mystery box')
	.add('Untradeable Mystery box')
	.add('Abyssal dragon bones', [100, 500], 2)
	.add('Coins', [20_000_000, 100_000_000], 2)
	.add(LampTable, [1, 3])
	.add('Clue scroll (beginner)', [5, 10], 2)
	.add('Clue scroll (easy)', [4, 9], 2)
	.add('Clue scroll (medium)', [4, 9], 2)
	.add('Clue scroll (hard)', [3, 6], 2)
	.add('Clue scroll (elite)', [4, 9], 2)
	.add('Clue scroll (master)', [2, 5], 2)
	.add('Manta ray', [100, 600], 2)
	.add(TreeHerbSeedTable, [1, 15])
	.add('Prayer potion(4)', [5, 40])
	.add('Saradomin brew(4)', [5, 40])
	.add('Super restore(4)', [5, 20])
	.add('Monkey nuts', 2)
	.add('Shark', [100, 200], 2)
	.add('Beer', [500, 5000])
	.add('Tchiki monkey nuts')
	.add('Magic seed', [20, 50]);

export const testerGiftTable = new LootTable()
	.every(baseTGBTable, [3, 7])
	.every('Clue scroll (grandmaster)', [1, 3])
	.every(LampTable, [1, 2])
	.add('Rocktail', [30, 60])
	.add('Tradeable mystery box', [1, 3])
	.add(baseTGBTable);

export const MonkeyCrateTable = new LootTable()
	.add('Avocado seed', [2, 5], 2)
	.add('Lychee seed', [2, 5], 2)
	.add('Mango seed', [2, 5])
	.add('Magic banana')
	.add(
		new LootTable()
			.add('Clue scroll (hard)')
			.add('Clue scroll (elite)')
			.add('Clue scroll (master)')
			.add('Clue scroll (grandmaster)')
	)
	.add(MysteryBoxes)
	.add(LampTable);

export const FestivePresentTable = new LootTable()
	.tertiary(50, 'Seer')
	.tertiary(20, 'Frozen santa hat')
	.tertiary(3, 'Golden shard')
	.tertiary(4, 'Festive jumper (2021)')
	.add('Toy soldier')
	.add('Toy doll')
	.add('Toy cat');

export const IndependenceBoxTable = new LootTable().add('Fireworks').add('Fireworks').add('Liber tea').add("Sam's hat");

const spookyEpic = new LootTable().add('Spooky partyhat').add('Orange halloween mask');
const spookyRare = new LootTable()
	.add('Necronomicon')
	.add("M'eye hat")
	.add('Back pain')
	.add('Witch hat')
	.add('Spooky mask');
const spookyCommon = new LootTable()
	.add('Toffeet')
	.add('Chocolified skull')
	.add('Eyescream')
	.add("Choc'rock")
	.add('Rotten sweets')
	.add('Gloom and doom potion')
	.add('Handled candle');

export const spookyTable = new LootTable()
	.tertiary(10, 'Mysterious token')
	.add(spookyEpic, 1, 1)
	.add(spookyRare, 1, 3)
	.add(spookyCommon, 1, 8);

export const RoyalMysteryBoxTable = new LootTable()
	.add('Diamond crown', 1, 2)
	.add('Diamond sceptre', 1, 2)
	.add('Corgi');
export const GamblersBagTable = new LootTable()
	.add('4 sided die', 1, 6)
	.add('6 sided die', 1, 6)
	.add('8 sided die', 1, 4)
	.add('10 sided die', 1, 4)
	.add('12 sided die', 1, 3)
	.add('20 sided die', 1, 3)
	.add('100 sided die');

export const BirthdayPackTable = new LootTable()
	.add('Glass of bubbly')
	.add('Party horn')
	.add('Party popper')
	.add('Party cake')
	.add('Sparkler', [2, 10])
	.add('Party music box')
	.tertiary(20, 'Cake hat');

export const BeachMysteryBoxTable = new LootTable()
	.add('Snappy the Turtle')
	.add('Beach ball')
	.add('Water balloon')
	.add('Ice cream')
	.add('Crab hat');

export const DwarvenCrateTable = new LootTable()
	.add('Dwarven ore')
	.add('Dwarven stout', 2, 2)
	.add('Dwarven lore', 2)
	.add('Dwarven rock cake', 2)
	.add('Dwarven helmet', 1, 3)
	.add('Hammer', 1, 5)
	.add('Steel pickaxe')
	.add('Pickaxe handle', 1, 3)
	.add('Beer', 1, 3)
	.add('Kebab', 1, 3);

export const BlacksmithCrateTable = new LootTable()
	.add('Blacksmith helmet')
	.add('Blacksmith top')
	.add('Blacksmith apron')
	.add('Blacksmith gloves')
	.add('Blacksmith boots');

export const magicCreateCrate = new LootTable()
	.add('Pure essence', [500, 1000], 4)
	.add(ExoticSeedsTable)
	.add('Coins', [50_000, 1_000_000])
	.tertiary(150, 'Magus scroll')
	.tertiary(100, LampTable)
	.add('Clue scroll (beginner)', 1, 2)
	.add('Clue scroll (easy)', 1, 2)
	.add('Clue scroll (medium)', 1)
	.add(RuneTable, [1, 10], 3);
