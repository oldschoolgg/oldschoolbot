import { randFloat, roll, shuffleArr } from '@oldschoolgg/rng';
import { SimpleTable, sumArr, Time } from '@oldschoolgg/toolkit';

import { Bank, type ItemBank, Items, type LootBank, LootTable } from '@/osrs/index.js';

export interface TeamMember {
	id: string;
	personalPoints: number;
	canReceiveAncientTablet?: boolean;
	canReceiveDust?: boolean;
}

interface ChambersOfXericOptions {
	challengeMode?: boolean;
	timeToComplete?: number;
	team: TeamMember[];
}

const itemScales = new Map<number, number>();

for (const [name, scale] of Object.entries({
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
})) {
	itemScales.set(Items.getId(name), scale as number);
}

const NonUniqueTable = new SimpleTable<number>();
for (const [id] of itemScales.entries()) NonUniqueTable.add(id);

const CoXUniqueTable: LootTable = new LootTable()
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

export class ChambersOfXericClass {
	name = 'Chambers of Xeric';
	// allItems: number[] = [...CoXUniqueTable.allItems, ...NonUniqueTable.table.map(i => i.item)];
	maxRoll: number = 570_000 * (1 / 8675);

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

	public eligibleForDust(teamSize: number, completionTime: number): boolean {
		for (const [teamSizeRange, timeRequired] of cmTeamTimes) {
			if (teamSize <= teamSizeRange) {
				return completionTime <= timeRequired;
			}
		}

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

	public rollNonUniqueLoot(personalPoints: number): ItemBank {
		const items: number[] = [];
		while (items.length < 2) {
			const rolledItem = NonUniqueTable.roll()!;
			if (!items.includes(rolledItem)) items.push(rolledItem);
		}
		const x = itemScales.get(items[0])!;
		const y = itemScales.get(items[1])!;
		const loot: ItemBank = {
			[items[0]]: Math.max(1, Math.floor(personalPoints / x)),
			[items[1]]: Math.max(1, Math.floor(personalPoints / y))
		};

		if (roll(12)) {
			loot[12073] = 1;
		}

		return loot;
	}

	public complete(_options: ChambersOfXericOptions): LootBank {
		const options = JSON.parse(JSON.stringify(_options)) as ChambersOfXericOptions;
		const eligibleForDust =
			typeof options.timeToComplete === 'number' &&
			options.challengeMode &&
			this.eligibleForDust(options.team.length, options.timeToComplete);

		if (eligibleForDust) {
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

			// If the team and team member is eligible for dust, roll for this user.
			if (eligibleForDust && teamMember.canReceiveDust && roll(400)) {
				lootResult[teamMember.id].add('Metamorphic dust');
			}

			if (eligibleForDust && roll(75)) {
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
			const receipientID = uniqueDeciderTable.roll()!;
			const uniqueItem = uniqueLoot.random()!;
			lootResult[receipientID].add(uniqueItem.id, 1);
			uniqueLoot.remove(uniqueItem.id, 1);
			if (roll(53)) {
				lootResult[receipientID].add('Olmlet');
			}
			uniqueDeciderTable.delete(receipientID);
		}

		for (const leftOverRecipient of uniqueDeciderTable.table) {
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

export const ChambersOfXeric: ChambersOfXericClass = new ChambersOfXericClass();
