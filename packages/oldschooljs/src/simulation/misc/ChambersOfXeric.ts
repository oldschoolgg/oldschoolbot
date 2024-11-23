import { Time, randFloat, roll, shuffleArr, sumArr } from 'e';

import type { ItemBank, LootBank } from '../../meta/types';
import Bank from '../../structures/Bank';
import LootTable from '../../structures/LootTable';
import Minigame from '../../structures/Minigame';
import SimpleTable from '../../structures/SimpleTable';
import { resolveNameBank } from '../../util/bank';
import itemID from '../../util/itemID';
import { JSONClone } from '../../util/util';

export interface TeamMember {
	id: string;
	personalPoints: number;
	/**
	 * Whether this team member can receive an ancient tablet, assumed false.
	 *
	 * Only received if players do not own one or have not consumed it already.
	 */
	canReceiveAncientTablet?: boolean;
	/**
	 * Whether this team member can receive Metamorphic dust.
	 *
	 * https://twitter.com/JagexAsh/status/1050349088124952576.
	 */
	canReceiveDust?: boolean;
}

export interface ChambersOfXericOptions {
	/**
	 * Whether or not this raid is in Challenge Mode or not.
	 */
	challengeMode?: boolean;
	/**
	 * The time in *milliseconds* that it took to complete the raid, used for rewarding with dust in challenge mode.
	 */
	timeToComplete?: number;
	/**
	 * The members of the raid team, can be only 1 person.
	 */
	team: TeamMember[];
}

const itemScales = resolveNameBank({
	'Death rune': 36,
	'Blood rune': 32,
	'Soul rune': 20,
	'Rune arrow': 14,
	'Dragon arrow': 202,
	'Grimy toadflax': 525,
	'Grimy ranarr weed': 800,
	'Grimy irit leaf': 162,
	'Grimy avantoe': 234,
	'Grimy kwuarm': 378,
	'Grimy snapdragon': 1348,
	'Grimy cadantine': 358,
	'Grimy lantadyme': 249,
	'Grimy dwarf weed': 201,
	'Grimy torstol': 824,
	'Silver ore': 20,
	Coal: 20,
	'Gold ore': 44,
	'Mithril ore': 32,
	'Adamantite ore': 167,
	'Runite ore': 2093,
	'Uncut sapphire': 189,
	'Uncut emerald': 142,
	'Uncut ruby': 250,
	'Uncut diamond': 514,
	'Lizardman fang': 28,
	'Pure essence': 2,
	Saltpetre: 24,
	'Teak plank': 100,
	'Mahogany plank': 240,
	Dynamite: 54,
	// These 2 items are "special" but not really, they just only drop a max of 1.
	'Torn prayer scroll': 999_999,
	'Dark relic': 999_999
});

const NonUniqueTable = new SimpleTable<number>();
for (const itemID of Object.keys(itemScales)) NonUniqueTable.add(Number.parseInt(itemID));

export const CoXUniqueTable = new LootTable()
	.add('Dexterous prayer scroll', 1, 20)
	.add('Arcane prayer scroll', 1, 20)

	.add('Twisted buckler', 1, 4)
	.add('Dragon hunter crossbow', 1, 4)

	.add("Dinh's bulwark", 1, 3)
	.add('Ancestral hat', 1, 3)
	.add('Ancestral robe top', 1, 3)
	.add('Ancestral robe bottom', 1, 3)
	.add('Dragon claws', 1, 3)

	.add('Elder maul', 1, 2)
	.add('Kodai insignia', 1, 2)
	.add('Twisted bow', 1, 2);

const cmTeamTimes = [
	[1, Time.Hour + Time.Minute * 10],
	[2, Time.Hour + Time.Minute * 5],
	[3, Time.Minute * 50],
	[4, Time.Minute * 45],
	[10, Time.Minute * 42],
	[15, Time.Minute * 45],
	[23, Time.Hour]
];

export class ChambersOfXericClass extends Minigame {
	id = 1;
	aliases = ['raids', 'cox'];
	name = 'Chambers of Xeric';
	allItems: number[] = [...CoXUniqueTable.allItems, ...NonUniqueTable.table.map(i => i.item)];
	maxRoll = 570_000 * (1 / 8675);

	/**
	 * For every 8,675 total points obtained, a 1% chance to obtain a unique loot is given.
	 * This chance is capped at 65.7% (570k points), further points will be sent to
	 * roll for a second unique loot. A team who possesses 855,000 points in total has
	 * an 65.7% chance to receive a unique loot, then a 32.85% chance to obtain a
	 * second unique loot. Up to three unique rewards can be obtained per raid.
	 */
	public determineUniqueChancesFromTeamPoints(teamPoints: number): number[] {
		const chances = [];

		let totalChancePercentage = teamPoints * (1 / 8675);

		for (let i = 0; i < 3; i++) {
			if (totalChancePercentage > this.maxRoll) {
				chances.push(this.maxRoll);
				totalChancePercentage -= this.maxRoll;
			} else {
				chances.push(totalChancePercentage);
				break;
			}
		}

		return chances;
	}

	/**
	 * Returns true if the team is elligible to receive dust based on their
	 * completion time.
	 *
	 * https://oldschool.runescape.wiki/w/Chambers_of_Xeric/Challenge_Mode#Rewards
	 *
	 * @param teamSize How many members in the raid team.
	 * @param completionTime The completion time of the raid, in *milliseconds*.
	 */
	public elligibleForDust(teamSize: number, completionTime: number): boolean {
		// For every required time there is, if their team size is in that range,
		// return true if their time is <= the required time.
		for (const [teamSizeRange, timeRequired] of cmTeamTimes) {
			if (teamSize <= teamSizeRange) {
				return completionTime <= timeRequired;
			}
		}

		// If their team is > 23, must be 1h 20m.
		return completionTime <= Time.Hour + Time.Minute * 20;
	}

	public rollLootFromChances(chances: number[]): Bank {
		let rolls = 0;

		for (const chance of chances) {
			if (randFloat(0, 100) < chance) {
				rolls++;
			}
		}

		return CoXUniqueTable.roll(rolls);
	}

	// We're rolling 2 non-unique loots based off a number of personal points.
	public rollNonUniqueLoot(personalPoints: number): ItemBank {
		// First, pick which items we will be giving them, without giving a duplicate.
		const items: number[] = [];
		while (items.length < 2) {
			const rolledItem = NonUniqueTable.roll();
			if (!items.includes(rolledItem)) items.push(rolledItem);
		}

		// Now return an ItemBank of these 2 items, the quantity is [points / scale].
		// With a minimum of 1.
		const loot: ItemBank = {
			[items[0]]: Math.max(1, Math.floor(personalPoints / itemScales[items[0]])),
			[items[1]]: Math.max(1, Math.floor(personalPoints / itemScales[items[1]]))
		};

		if (roll(12)) {
			loot[itemID('Clue scroll (elite)')] = 1;
		}

		return loot;
	}

	public complete(_options: ChambersOfXericOptions): LootBank {
		const options = JSONClone(_options);

		// Will only check for elligibility for dust if timeToComplete given, and challengeMode = true.
		const elligibleForDust =
			typeof options.timeToComplete === 'number' &&
			options.challengeMode &&
			this.elligibleForDust(options.team.length, options.timeToComplete);

		if (elligibleForDust) {
			// If in challenge mode, and elligible for dust, 5000pts is added to
			// each team member.
			// https://oldschool.runescape.wiki/w/Chambers_of_Xeric/Challenge_Mode#Rewards
			for (const member of options.team) {
				member.personalPoints += 5000;
			}
		}

		// The sum of all members personal points is the team points.
		const teamPoints = sumArr(options.team.map(val => val.personalPoints));

		const dropChances = this.determineUniqueChancesFromTeamPoints(teamPoints);
		const uniqueLoot = this.rollLootFromChances(dropChances);

		const lootResult: LootBank = {};

		// This table is used to pick which team member gets the unique(s).
		const uniqueDeciderTable = new SimpleTable<string>();

		for (const teamMember of options.team) {
			// Give every team member a Loot.
			lootResult[teamMember.id] = new Bank();

			// If the team and team member is elligible for dust, roll for this user.
			if (elligibleForDust && teamMember.canReceiveDust && roll(400)) {
				lootResult[teamMember.id].add('Metamorphic dust');
			}

			if (elligibleForDust && roll(75)) {
				lootResult[teamMember.id].add('Twisted ancestral colour kit');
			}

			// If the team member can receive an Ancient Tablet, roll for this user.
			if (teamMember.canReceiveAncientTablet && roll(10)) {
				lootResult[teamMember.id].add('Ancient tablet');
			}

			// Add this member to the "unique decider table", using their points as the weight.
			uniqueDeciderTable.add(teamMember.id, teamMember.personalPoints);
		}

		// For every unique item received, add it to someones loot.
		while (uniqueLoot.length > 0) {
			if (uniqueDeciderTable.table.length === 0) break;
			const receipientID = uniqueDeciderTable.roll();
			const uniqueItem = uniqueLoot.random()!;
			lootResult[receipientID].add(uniqueItem.id, 1);
			uniqueLoot.remove(uniqueItem.id, 1);
			if (roll(53)) {
				lootResult[receipientID].add('Olmlet');
			}
			uniqueDeciderTable.delete(receipientID);
		}

		// For everyone who didn't receive a unique, i.e wasn't removed from the
		// unique decider table, give them a non-unique roll.
		for (const leftOverRecipient of uniqueDeciderTable.table) {
			// Find this member in the team, and get their points.
			const pointsOfThisMember = options.team.find(
				member => member.id === leftOverRecipient.item
			)!.personalPoints;

			const entries = Object.entries(this.rollNonUniqueLoot(pointsOfThisMember));
			for (const [itemID, quantity] of entries) {
				lootResult[leftOverRecipient.item].add(Number.parseInt(itemID), quantity);
			}
		}

		const onyxChance = options.team.length * 70;
		for (const bank of shuffleArr(Object.values(lootResult))) {
			if (roll(onyxChance)) {
				bank.add('Onyx');
				break;
			}
		}

		return lootResult;
	}
}

export const ChambersOfXeric = new ChambersOfXericClass();
