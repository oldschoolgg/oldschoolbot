import { IslandGemTable, IslandGemTable3x, IslandGemTable5x } from '@/lib/bso/monsters/VerdantIsland.js';

import { Emoji, Events } from '@oldschoolgg/toolkit';
import { Bank, itemID, LootTable } from 'oldschooljs';

import type { ArchaicMiningActivityTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { skillingPetDropRate } from '@/lib/util.js';

export type MiningType = 'dragonbone' | 'crystalline';

export interface ArchaicOre {
	id: number;
	name: string;
	level: number;
	xp: number;
	timeToMine: number;
	type: MiningType;
	petChance: number;
}

export const archaicOres: ArchaicOre[] = [
	{
		id: itemID('Dragon bones'),
		name: 'Dragon bones',
		level: 90,
		xp: 180,
		timeToMine: 2.2,
		type: 'dragonbone',
		petChance: 100_000
	},
	{
		id: itemID('Superior dragon bones'),
		name: 'Superior dragon bones',
		level: 95,
		xp: 260,
		timeToMine: 2.5,
		type: 'dragonbone',
		petChance: 100_000
	},
	{
		id: itemID('Abyssal dragon bones'),
		name: 'Abyssal dragon bones',
		level: 100,
		xp: 360,
		timeToMine: 2.8,
		type: 'dragonbone',
		petChance: 100_000
	},
	{
		id: itemID('Frost dragon bones'),
		name: 'Frost dragon bones',
		level: 105,
		xp: 480,
		timeToMine: 3.1,
		type: 'dragonbone',
		petChance: 100_000
	},
	{
		id: itemID('Royal dragon bones'),
		name: 'Royal dragon bones',
		level: 108,
		xp: 600,
		timeToMine: 3.4,
		type: 'dragonbone',
		petChance: 100_000
	},
	{
		id: itemID('Primordial bones'),
		name: 'Primordial bones',
		level: 110,
		xp: 750,
		timeToMine: 3.8,
		type: 'dragonbone',
		petChance: 100_000
	},

	{
		id: itemID('Crystalline ore'),
		name: 'Crystalline ore',
		level: 90,
		xp: 220,
		timeToMine: 2.2,
		type: 'crystalline',
		petChance: 100_000
	},
	{
		id: itemID('Gem Infused ore'),
		name: 'Gem Infused ore',
		level: 100,
		xp: 340,
		timeToMine: 2.8,
		type: 'crystalline',
		petChance: 100_000
	},
	{
		id: itemID('Dense Crystal shard'),
		name: 'Dense Crystal shard',
		level: 110,
		xp: 520,
		timeToMine: 3.8,
		type: 'crystalline',
		petChance: 100_000
	}
];

function generateArchaicMiningTable(currentMiningLevel: number, miningType: MiningType): LootTable {
	const relevantOres = archaicOres.filter((ore: ArchaicOre) => ore.type === miningType);
	const miningTable = new LootTable();

	if (miningType === 'dragonbone') {
		const baseOre = relevantOres[0];
		const weights = [18, 15, 12, 9, 6, 2];
		let totalActiveWeight = weights[0];
		miningTable.add(baseOre.id, 1, weights[0]);

		for (let i = 1; i < relevantOres.length; i++) {
			const ore = relevantOres[i];
			if (currentMiningLevel >= ore.level) {
				const weight = weights[i];
				miningTable.add(ore.id, 1, weight);
				totalActiveWeight += weight;
			}
		}

		const blankWeight = Math.round(totalActiveWeight * 2.57);
		miningTable.add(new LootTable(), 1, blankWeight);
	} else {
		miningTable.add(relevantOres[0].id, 1, 27);

		if (currentMiningLevel >= relevantOres[1].level) {
			miningTable.add(relevantOres[1].id, 1, 18);
		}

		if (currentMiningLevel >= relevantOres[2].level) {
			miningTable.add(relevantOres[2].id, [4, 5], 10);
		}

		miningTable.add(new LootTable(), 1, 6);
	}

	return miningTable;
}

export const archaicMiningTask: MinionTask = {
	type: 'ArchaicMining',
	async run(data: ArchaicMiningActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { channelId, quantity, duration, miningType } = data;
		const currentMiningLevel = user.skillsAsLevels.mining;

		const miningTable = generateArchaicMiningTable(currentMiningLevel, miningType);
		const relevantOres = archaicOres.filter((ore: ArchaicOre) => ore.type === miningType);
		const availableOres = relevantOres.filter((ore: ArchaicOre) => currentMiningLevel >= ore.level);
		const bestOre = availableOres[availableOres.length - 1];

		let miningXP = quantity * bestOre.xp;
		const prayerXP = miningType === 'dragonbone' ? quantity * (bestOre.xp * 0.5) : 0;
		const loot = new Bank();

		const rolledLoot = miningTable.roll(quantity);
		loot.add(rolledLoot);

		let bonusXP = 0;

		const prospectorPieces = ['Prospector helmet', 'Prospector jacket', 'Prospector legs', 'Prospector boots'];

		const prospectorCount = prospectorPieces.filter(piece => user.hasEquippedOrInBank(piece)).length;

		if (prospectorCount === 4) {
			const amountToAdd = Math.floor(miningXP * (2.5 / 100));
			miningXP += amountToAdd;
			bonusXP += amountToAdd;
		} else if (prospectorCount > 0) {
			const amountToAdd = Math.floor(miningXP * ((prospectorCount * 0.5) / 100));
			miningXP += amountToAdd;
			bonusXP += amountToAdd;
		}

		const hasMiningMasterCape =
			user.hasEquippedOrInBank('Mining master cape') || user.hasEquippedOrInBank('Mining master cape (inverted)');

		let lootMultiplier = 1;
		if (hasMiningMasterCape) lootMultiplier *= 2;

		if (lootMultiplier > 1) {
			loot.multiply(lootMultiplier);
		}

		if (miningType === 'dragonbone') {
			for (let i = 0; i < quantity; i++) {
				if (rng.roll(35_000)) loot.add('Primordial heartstring');
				if (rng.roll(35_000)) loot.add('Primordial spine');
			}
		} else {
			for (let i = 0; i < quantity; i++) {
				if (rng.roll(250)) {
					loot.add(IslandGemTable5x.roll());
				} else if (rng.roll(100)) {
					loot.add(IslandGemTable3x.roll());
				} else if (rng.roll(20)) {
					loot.add(IslandGemTable.roll());
				}
			}
		}

		let xpRes = await user.addXP({
			skillName: 'mining',
			amount: Math.ceil(miningXP),
			duration,
			source: 'ArchaicMining'
		});

		if (prayerXP > 0) {
			xpRes += '\n';
			xpRes += await user.addXP({
				skillName: 'prayer',
				amount: Math.ceil(prayerXP),
				duration,
				source: 'ArchaicMining'
			});
		}

		let str = `${user}, ${user.minionName} finished ${miningType === 'dragonbone' ? 'dragonbone' : 'crystalline'} mining! ${xpRes}`;

		if (hasMiningMasterCape) {
			str += '\n**2x loot for Mining master cape.**';
		}

		if (bonusXP > 0) {
			str += `\n\n**Bonus Mining XP:** ${bonusXP.toLocaleString()}`;
		}

		if (loot.has('Primordial heartstring')) {
			str += '\n**You found a Primordial heartstring!**';
		}
		if (loot.has('Primordial spine')) {
			str += '\n**You found a Primordial spine!**';
		}

		const { petDropRate } = skillingPetDropRate(user, 'mining', bestOre.petChance);
		if (rng.roll(Math.ceil(petDropRate / quantity))) {
			loot.add('Rock golem');
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Mining} **${user.usernameOrMention}'s** minion, ${user.minionName}, just received a Rock golem while doing ${miningType} mining at level ${currentMiningLevel} Mining!`
			);
		}

		const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x ${miningType === 'dragonbone' ? 'Dragonbone' : 'Crystalline'} Mining`,
			user,
			previousCL
		});

		handleTripFinish({ user, channelId, message: { content: str, files: [image] }, data, loot });
	}
};
