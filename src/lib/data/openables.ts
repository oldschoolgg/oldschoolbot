import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Emoji } from '../constants';
import BirthdayPresentTable from '../simulation/birthdayPresent';
import CasketTable from '../simulation/casket';
import CrystalChestTable from '../simulation/crystalChest';
import itemID from '../util/itemID';

interface Openable {
	name: string;
	itemID: number;
	aliases: string[];
	table: LootTable;
	emoji: Emoji;
}

export const SpoilsOfWarBaseTable = new LootTable()
	.add('Pure essence', [4000, 6000], 6)
	.add('Coins', [20_000, 30_000], 5)
	.add('Raw lobster', [30, 60], 5)
	.add('Raw swordfish', [30, 60], 5)
	.add('Raw shark', [30, 60], 5)
	.add('Blood rune', [150, 300], 5)
	.add('Death rune', [150, 300], 5)
	.add('Nature rune', [150, 300], 5)
	.add('Adamant bolts', [200, 400], 5)
	.add('Runite bolts', [100, 200], 5)
	.add('Adamant arrow', [200, 400], 5)
	.add('Rune arrow', [100, 200], 5)
	.add('Coal', [150, 300], 5)
	.add('Mithril ore', [80, 100], 5)
	.add('Coins', [2000, 3000], 4)
	.add('Uncut ruby', [15, 30], 4)
	.add('Uncut diamond', [15, 30], 4)
	.add('Soul rune', [150, 300], 2)
	.add('Soul rune', [500, 600], 2)
	.add('Rune full helm')
	.add('Rune platebody')
	.add('Rune platelegs')
	.add('Runite ore', [4, 8])
	.add('Tooth half of key')
	.add('Loop half of key')
	.add('Snapdragon seed')
	.add('Ranarr seed')
	.add(
		new LootTable()
			.add('Dragon med helm')
			.add('Dragon scimitar')
			.add('Dragon mace')
			.add('Dragon dagger')
			.add('Dragon longsword')
			.add('Bones')
			.add('Cabbage')
	);

export const SpoilsOfWarTable = new LootTable().tertiary(400, "Lil' creator").every(SpoilsOfWarBaseTable, 3);

export const NestBoxes = new LootTable()
	.add('Nest box (seeds)', 1, 12)
	.add('Nest box (ring)', 1, 5)
	.add('Nest box (empty)', 1, 3);

const BaseGemBagTable = new LootTable()
	.add('Uncut sapphire', 1, 4993)
	.add('Uncut emerald', 1, 3468)
	.add('Uncut ruby', 1, 1180)
	.add('Uncut diamond', 1, 309)
	.add('Uncut dragonstone', 1, 62)
	.oneIn(100_000_000, 'Uncut onyx');

const BagFullOfGemsTable = new LootTable().every(BaseGemBagTable, 40);

const Openables: Openable[] = [
	{
		name: 'Birthday present',
		itemID: 11_918,
		aliases: ['present', 'birthday present'],
		table: BirthdayPresentTable,
		emoji: Emoji.BirthdayPresent
	},
	{
		name: 'Casket',
		itemID: 405,
		aliases: ['casket'],
		table: CasketTable,
		emoji: Emoji.Casket
	},
	{
		name: 'Crystal chest',
		itemID: 989,
		aliases: ['crystal chest'],
		table: CrystalChestTable,
		emoji: Emoji.Casket
	},
	{
		name: 'Builders supply crate',
		itemID: 24_884,
		aliases: ['builders supply crate'],
		table: new LootTable()
			.add('Oak plank', [28, 30])
			.add('Teak plank', [15, 16])
			.add('Mahogany plank', [6, 7])
			.add('Steel bar', [23, 24])
			.add('Soft clay', [45, 48])
			.add('Bolt of cloth', 15)
			.add('Limestone brick', 9),
		emoji: Emoji.Casket
	},
	{
		name: 'Spoils of war',
		itemID: itemID('Spoils of war'),
		aliases: ['Spoils of war'],
		table: SpoilsOfWarTable,
		emoji: Emoji.Casket
	},
	{
		name: 'Bag full of gems',
		itemID: itemID('Bag full of gems'),
		aliases: ['bag full of gems', 'gem bag'],
		table: BagFullOfGemsTable,
		emoji: Emoji.Casket
	}
];

export default Openables;
