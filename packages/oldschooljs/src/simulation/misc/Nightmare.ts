import { calcPercentOfNum, calcWhatPercent, percentChance, randInt, roll } from 'e';

import type { LootBank } from '../../meta/types';
import Bank from '../../structures/Bank';
import LootTable from '../../structures/LootTable';
import SimpleTable from '../../structures/SimpleTable';
import { resolveNameBank } from '../../util/bank';

export interface TeamMember {
	id: string;
	damageDone: number;
}

export interface NightmareOptions {
	/**
	 * The members of the team killing the nightmare.
	 */
	team: TeamMember[];
	isPhosani: boolean;
}

const data: Record<string, [number[], number]> = {
	// [name, [quantity_range, weighting]]

	// Runes and ammunition
	'Cosmic rune': [[15, 218], 4],
	'Nature rune': [[6, 165], 4],
	'Death rune': [[24, 176], 4],
	'Blood rune': [[13, 129], 4],
	'Soul rune': [[12, 126], 4],
	'Adamant arrow': [[32, 533], 3],
	'Rune arrow': [[12, 539], 3],
	Cannonball: [[72, 192], 2],

	// Resources
	'Yew logs': [[14, 121], 4],
	'Magic logs': [[3, 55], 4],
	'Gold ore': [[14, 174], 4],
	Coal: [[16, 253], 4],
	'Mithril ore': [[15, 168], 4],
	'Adamantite ore': [[8, 50], 4],
	'Grimy cadantine': [[1, 14], 4],
	'Grimy torstol': [[1, 16], 4],
	'Uncut emerald': [[1, 41], 3],
	'Uncut ruby': [[2, 35], 3],
	'Snapdragon seed': [[1, 6], 1],

	// Consumables
	Shark: [[1, 15], 6],
	Bass: [[1, 18], 6],
	'Prayer potion(3)': [[1, 10], 5],
	'Saradomin brew(3)': [[1, 10], 5],
	'Zamorak brew(3)': [[1, 10], 5],
	'Sanfew serum(3)': [[1, 11], 5],

	Coins: [[2717, 43_854], 2]
};
const nonUniqueItemRanges = resolveNameBank(data);

const NonUniqueTable = new SimpleTable<number>();
for (const [id, data] of Object.entries(nonUniqueItemRanges)) {
	NonUniqueTable.add(Number.parseInt(id), data[1]);
}

// Phosani
const phosaniData: Record<string, [number[], number]> = {
	// [name, [quantity_range, weighting]]

	// Runes and ammunition
	'Cosmic rune': [[247, 420], 4],
	'Nature rune': [[165, 305], 4],
	'Death rune': [[165, 305], 4],
	'Blood rune': [[343, 765], 4],
	'Soul rune': [[110, 228], 4],
	Cannonball: [[137, 382], 4],
	'Rune arrow': [[412, 957], 3],

	// Resources
	'Mithril ore': [[165, 305], 5],
	Coal: [[220, 458], 4],
	'Gold ore': [[165, 305], 4],
	'Adamantite ore': [[40, 95], 4],
	'Magic logs': [[40, 95], 4],
	'Grimy cadantine': [[13, 26], 4],
	'Grimy torstol': [[13, 26], 4],
	'Snapdragon seed': [[5, 10], 3],
	'Uncut emerald': [[33, 75], 3],
	'Uncut ruby': [[27, 60], 3],
	'Runite ore': [[11, 26], 2],

	// Consumables
	Bass: [[16, 29], 6],
	Shark: [[13, 26], 6],
	'Prayer potion(3)': [[8, 15], 5],
	'Sanfew serum(3)': [[6, 12], 5],
	'Saradomin brew(3)': [[8, 15], 5],
	'Zamorak brew(3)': [[8, 15], 5],

	Coins: [[41_417, 72_013], 2]
};
const phosaniNonUniqueItemRanges = resolveNameBank(phosaniData);

const PhosaniNonUniqueTable = new SimpleTable<number>();
for (const [id, data] of Object.entries(phosaniNonUniqueItemRanges)) {
	PhosaniNonUniqueTable.add(Number.parseInt(id), data[1]);
}

const GearTable = new SimpleTable<string>()
	.add("Inquisitor's mace")
	.add("Inquisitor's great helm", 2)
	.add("Inquisitor's hauberk", 2)
	.add("Inquisitor's plateskirt", 2)
	.add('Nightmare staff', 3);

const OrbTable = new SimpleTable<string>().add('Eldritch orb').add('Volatile orb').add('Harmonised orb');

const mvpTertiary = new LootTable()
	.tertiary(190, 'Clue scroll (elite)')
	.tertiary(1900, 'Jar of dreams')
	.tertiary(3800, 'Little nightmare');

const nonMvpTertiary = new LootTable()
	.tertiary(200, 'Clue scroll (elite)')
	.tertiary(4000, 'Little nightmare')
	.tertiary(2000, 'Jar of dreams');

const phosaniTertiary = new LootTable()
	.tertiary(35, 'Clue scroll (elite)')
	.tertiary(100, 'Slepey tablet')
	.tertiary(200, 'Parasitic egg')
	.tertiary(1400, 'Little nightmare')
	.tertiary(4000, 'Jar of dreams');

class NightmareClass {
	hp = 2400;

	allItems: number[] = [
		...NonUniqueTable.table.map(i => i.item),
		...GearTable.table.map(i => Number(i.item)),
		...OrbTable.table.map(i => Number(i.item)),
		...mvpTertiary.allItems,
		...nonMvpTertiary.allItems
	];

	public rollNonUniqueLoot(percentage: number, isMvp: boolean, isPhosani: boolean): [number, number] {
		const [table, ranges] = isPhosani
			? [PhosaniNonUniqueTable, phosaniNonUniqueItemRanges]
			: [NonUniqueTable, nonUniqueItemRanges];
		const item = table.roll();

		const [range] = ranges[item];

		if (isPhosani) {
			return [item, randInt(range[0], range[1])];
		}

		// If the quantity range of the item is 50-100, we
		// give you 50 qty to start, then increase it.
		let quantity = range[0];
		quantity += calcPercentOfNum(percentage, range[1]) - range[0];

		if (isMvp) quantity *= 1.1;

		quantity = Math.floor(Math.max(quantity, range[0]));

		return [item, quantity];
	}

	public kill(options: Readonly<NightmareOptions>): LootBank {
		const mvp = options.team.sort((a, b) => b.damageDone - a.damageDone)[0];

		const parsedTeam = options.team.map(teamMember => ({
			...teamMember,
			percentDamage: Math.floor(calcWhatPercent(teamMember.damageDone, this.hp)),
			scaledPercentDamage: Math.floor(calcWhatPercent(teamMember.damageDone, this.hp / options.team.length)),
			mvp: mvp === teamMember
		}));

		const lootResult: LootBank = {};

		for (const teamMember of parsedTeam) {
			lootResult[teamMember.id] = new Bank();
		}

		if (options.isPhosani) {
			if (roll(143)) {
				lootResult[options.team[0].id].add(GearTable.roll());
			}

			if (roll(533)) {
				lootResult[options.team[0].id].add(OrbTable.roll());
			}
		} else {
			// Construct a weighted table, where the weighting is the percent of the total HP that the team member has damaged,
			// for example, dealing 50% off of the nightmares health will give a weighting of 50, so they're 5x more likely
			// to get the unique than the person who dealt 10%. However, in most realistic scenarios, the team members will have
			// done very similar amounts of damage, varying by only a few percent.
			const WeightedUniqueTable = new SimpleTable<string>();
			for (const teamMember of parsedTeam) {
				WeightedUniqueTable.add(teamMember.id, teamMember.percentDamage);
			}

			function giveWeightedDrop(item: string): void {
				const recipient = WeightedUniqueTable.roll();
				lootResult[recipient].add(item);
			}

			if (roll(84)) {
				giveWeightedDrop(GearTable.roll());
			}

			if (roll(320)) {
				giveWeightedDrop(OrbTable.roll());
			}

			const secondRollChance = Math.min(75, parsedTeam.length - 5);
			if (secondRollChance > 0 && percentChance(secondRollChance)) {
				if (roll(320)) {
					giveWeightedDrop(OrbTable.roll());
				}
				if (roll(84)) {
					giveWeightedDrop(GearTable.roll());
				}
			}
		}

		// Hand out non-uniques
		for (const teamMember of parsedTeam) {
			if (lootResult[teamMember.id].length === 0) {
				lootResult[teamMember.id].add(
					...this.rollNonUniqueLoot(teamMember.scaledPercentDamage, teamMember.mvp, options.isPhosani)
				);
			}
			lootResult[teamMember.id].add(teamMember.mvp ? 'Big bones' : 'Bones');
			lootResult[teamMember.id].add(
				options.isPhosani ? phosaniTertiary.roll() : teamMember.mvp ? mvpTertiary.roll() : nonMvpTertiary.roll()
			);
		}

		return lootResult;
	}
}

const Nightmare = new NightmareClass();

export default Nightmare;
