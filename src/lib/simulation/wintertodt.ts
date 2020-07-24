/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ItemBank } from '../types';
import LootTable from 'oldschooljs/dist/structures/LootTable';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';
import Loot from 'oldschooljs/dist/structures/Loot';
import { rand, roll } from 'oldschooljs/dist/util/util';
import itemID from '../util/itemID';
import { LevelRequirements, SkillsEnum } from '../skilling/types';
import { ReturnedLootItem } from 'oldschooljs/dist/meta/types';
import resolveItems from '../util/resolveItems';
import { calcPercentOfNum, convertXPtoLVL, randomItemFromArray } from '../util';
import { normal } from '../util/normal';

interface WintertodtCrateOptions {
	points: number;
	itemsOwned: ItemBank;
	skills: Partial<LevelRequirements>;
}

type WintertodtTableSlot = [number, [number, number]];
type WintertodtTable = WintertodtTableSlot[];

function todtTable(table: [string, [number, number]][]): WintertodtTable {
	return table.map(slot => [itemID(slot[0]), slot[1]]);
}

const FishTable = todtTable([
	['Raw anchovies', [6, 11]],
	['Raw trout', [6, 11]],
	['Raw salmon', [6, 11]],
	['Raw tuna', [6, 11]],
	['Raw lobster', [6, 11]],
	['Raw swordfish', [6, 11]],
	['Raw shark', [6, 11]]
]);

const GemTable = todtTable([
	['Uncut sapphire', [1, 3]],
	['Uncut emerald', [1, 3]],
	['Uncut ruby', [2, 4]],
	['Uncut diamond', [1, 3]]
]);

const LogTable = todtTable([
	['Oak logs', [10, 20]],
	['Willow logs', [10, 20]],
	['Teak logs', [10, 20]],
	['Maple logs', [10, 20]],
	['Mahogany logs', [10, 20]],
	['Yew logs', [10, 20]],
	['Magic logs', [10, 20]]
]);

const OreTable = todtTable([
	['Limestone', [3, 7]],
	['Silver ore', [10, 12]],
	['Iron ore', [5, 15]],
	['Coal', [10, 14]],
	['Gold ore', [8, 11]],
	['Mithril ore', [3, 5]],
	['Adamantite ore', [2, 3]],
	['Runite ore', [1, 2]]
]);

const HerbTable = todtTable([
	['Grimy guam leaf', [3, 6]],
	['Grimy marrentill', [3, 6]],
	['Grimy tarromin', [3, 6]],
	['Grimy harralander', [3, 6]],
	['Grimy ranarr weed', [1, 3]],
	['Grimy irit leaf', [3, 5]],
	['Grimy avantoe', [3, 5]],
	['Grimy kwuarm', [2, 4]],
	['Grimy cadantine', [2, 4]],
	['Grimy lantadyme', [2, 4]],
	['Grimy dwarf weed', [2, 4]],
	['Grimy torstol', [1, 3]]
]);

const OtherTable = new LootTable()
	.add('Coins', [2000, 5000], 36)
	.add('Saltpetre', [3, 5], 6)
	.add('Dynamite', [3, 5], 6)
	.add('Burnt page', [7, 33], 2)
	.add('Pure essence', [30, 60], 1);

const TreeSeedsTable = todtTable([
	['Acorn', [1, 1]],
	['Willow seed', [1, 2]],
	['Maple seed', [1, 2]],
	['Banana tree seed', [1, 2]],
	['Teak seed', [1, 2]],
	['Mahogany seed', [1, 2]],
	['Yew seed', [1, 2]],
	['Magic seed', [1, 3]]
]);

const HerbSeedsTable = todtTable([
	['Ranarr seed', [1, 3]],
	['Toadflax seed', [1, 3]],
	['Irit seed', [1, 3]],
	['Avantoe seed', [1, 3]],
	['Kwuarm seed', [1, 3]],
	['Snapdragon seed', [1, 3]],
	['Cadantine seed', [1, 3]],
	['Lantadyme seed', [1, 3]],
	['Dwarf weed seed', [1, 3]],
	['Torstol seed', [1, 3]]
]);

const OtherSeedsTable = todtTable([
	['Watermelon seed', [3, 7]],
	['Snape grass seed', [3, 7]],
	['Spirit seed', [1, 1]]
]);

const MaterialTables = new SimpleTable<WintertodtTable>()
	.add(GemTable)
	.add(FishTable)
	.add(LogTable)
	.add(HerbTable)
	.add(OreTable);

const SeedTables = new SimpleTable<WintertodtTable>()
	.add(OtherSeedsTable)
	.add(HerbSeedsTable)
	.add(HerbSeedsTable)
	.add(HerbSeedsTable)
	.add(TreeSeedsTable);

const pyroPieces = resolveItems([
	'Pyromancer hood',
	'Pyromancer garb',
	'Pyromancer robe',
	'Pyromancer boots'
]) as number[];

export class WintertodtCrateClass {
	public pickWeightedLootItem<T>(lvl: number, array: T[]): T {
		const maxIndex = Math.max(
			Math.floor(calcPercentOfNum(Math.min(lvl + 15, 99), array.length)),
			1
		);
		const minIndex = Math.floor(calcPercentOfNum(Math.max(lvl - 70, 1), array.length));
		const avg = (maxIndex + minIndex) / 2;
		const rolledIndex = Math.min(
			Math.max(
				Math.round(
					normal(avg * (lvl > 50 ? 1.2 : 1.1), (avg - minIndex) * (lvl > 50 ? 1.8 : 2), 3)
				),
				minIndex
			),
			maxIndex
		);

		return array[rolledIndex];
	}

	determineSkillOfTableSlot(table: WintertodtTable) {
		switch (table) {
			case HerbTable:
				return SkillsEnum.Herblore;
			case LogTable:
				return SkillsEnum.Woodcutting;
			case GemTable:
				return SkillsEnum.Crafting;
			case FishTable:
				return SkillsEnum.Fishing;
			case OreTable:
				return SkillsEnum.Mining;
			default:
				return SkillsEnum.Farming;
		}
	}

	public lootRoll(skills: Partial<LevelRequirements>): ReturnedLootItem[] {
		const roll = rand(1, 9);

		if (roll <= 6) {
			const matTable = roll === 1 ? SeedTables.roll() : MaterialTables.roll();
			const skill = this.determineSkillOfTableSlot(matTable.item);
			const skillLevel = convertXPtoLVL(skills[skill] ?? 1);
			const rolledItem = this.pickWeightedLootItem<WintertodtTableSlot>(
				skillLevel,
				matTable.item
			);
			return [
				{
					item: rolledItem[0],
					quantity: rand(rolledItem[1][0], rolledItem[1][1])
				}
			];
		}

		return OtherTable.roll();
	}

	public calcNumberOfRolls(points: number): number {
		// https://oldschool.runescape.wiki/w/Supply_crate#Drop_mechanic
		const base = points / 500;
		let rolls = Math.floor(base);
		const remainder = base % 1;
		if (Math.random() <= remainder) rolls++;
		return rolls + 1;
	}

	public rollUnique(itemsOwned: ItemBank): number | void {
		// https://oldschool.runescape.wiki/w/Supply_crate#Reward_rolls
		if (roll(10_000)) return itemID('Dragon axe');
		if (roll(5_000)) return itemID('Phoenix');
		if (roll(1_000)) return itemID('Tome of fire');
		if (roll(150)) {
			const glovesOwned = itemsOwned[itemID('Warm gloves')];

			// If they already own 3 gloves, give only magic seeds.
			if (glovesOwned && glovesOwned >= 3) {
				return itemID('Magic seed');
			}
			return itemID('Warm gloves');
		}

		if (roll(150)) {
			const torchesOwned = itemsOwned[itemID('Bruma torch')];

			// If they already own 3 gloves, give only magic seeds.
			if (torchesOwned && torchesOwned >= 3) {
				return itemID('Torstol seed');
			}
			return itemID('Bruma torch');
		}

		if (roll(150)) {
			return randomItemFromArray(pyroPieces);
		}
	}

	public open({ points, itemsOwned, skills }: WintertodtCrateOptions): ItemBank {
		const rolls = this.calcNumberOfRolls(points);
		if (rolls <= 0) {
			return {};
		}

		const loot = new Loot();

		for (let i = 0; i < rolls; i++) {
			const rolledUnique = this.rollUnique(itemsOwned);
			if (rolledUnique) {
				loot.add(rolledUnique);
				continue;
			}
			loot.add(this.lootRoll(skills));
		}

		return loot.values();
	}
}

export const WintertodtCrate = new WintertodtCrateClass();
