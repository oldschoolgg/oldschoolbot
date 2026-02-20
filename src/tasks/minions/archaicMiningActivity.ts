import { Emoji, Events } from '@oldschoolgg/toolkit';
import { Bank, itemID, LootTable } from 'oldschooljs';

import { IslandGemTable, IslandGemTable3x, IslandGemTable5x } from '@/lib/bso/monsters/VerdantIsland.js';
import addSkillingClueToLoot from '@/lib/minions/functions/addSkillingClueToLoot.js';
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
	clueScrollChance?: number;
}

export const archaicOres: ArchaicOre[] = [
	{ id: itemID('Dragon bones'), name: 'Dragon bones', level: 90, xp: 80, timeToMine: 4, type: 'dragonbone', petChance: 100000, clueScrollChance: 500000 },
	{ id: itemID('Superior dragon bones'), name: 'Superior dragon bones', level: 95, xp: 100, timeToMine: 4.5, type: 'dragonbone', petChance: 100000 },
	{ id: itemID('Abyssal dragon bones'), name: 'Abyssal dragon bones', level: 100, xp: 120, timeToMine: 5, type: 'dragonbone', petChance: 100000 },
	{ id: itemID('Frost dragon bones'), name: 'Frost dragon bones', level: 105, xp: 140, timeToMine: 5.5, type: 'dragonbone', petChance: 100000 },
	{ id: itemID('Royal dragon bones'), name: 'Royal dragon bones', level: 108, xp: 150, timeToMine: 5.75, type: 'dragonbone', petChance: 100000 },
	{ id: itemID('Primordial bones'), name: 'Primordial bones', level: 110, xp: 160, timeToMine: 6, type: 'dragonbone', petChance: 100000 },

	{ id: itemID('Crystalline ore'), name: 'Crystalline ore', level: 90, xp: 180, timeToMine: 4, type: 'crystalline', petChance: 100000, clueScrollChance: 500000 },
	{ id: itemID('Gem Infused ore'), name: 'Gem Infused ore', level: 100, xp: 240, timeToMine: 5, type: 'crystalline', petChance: 100000 },
	{ id: itemID('Dense Crystal shard'), name: 'Dense Crystal shard', level: 110, xp: 300, timeToMine: 6, type: 'crystalline', petChance: 100000 }
];

function generateArchaicMiningTable(currentMiningLevel: number, miningType: MiningType): LootTable {
	const relevantOres = archaicOres.filter((ore: ArchaicOre) => ore.type === miningType);
	const miningTable = new LootTable();

	if (miningType === 'dragonbone') {
		const baseOre = relevantOres[0];
		miningTable.add(baseOre.id, 1, 6);

		for (let i = 1; i < relevantOres.length; i++) {
			const ore = relevantOres[i];
			if (currentMiningLevel >= ore.level) {
				miningTable.add(ore.id, 1, 7 - i);
			}
		}
	} else {
		miningTable.add(relevantOres[0].id, 1, 3);

		if (currentMiningLevel >= relevantOres[1].level) {
			miningTable.add(relevantOres[1].id, 1, 2);
		}

		if (currentMiningLevel >= relevantOres[2].level) {
			miningTable.add(relevantOres[2].id, 1, 1);
		}
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
		const baseOre = relevantOres[0];

		let miningXP = 0;
		let prayerXP = 0;
		const loot = new Bank();

		if (miningType === 'dragonbone') {
			const bonesLoot = miningTable.roll(quantity);
			loot.add(bonesLoot);

			for (const ore of relevantOres) {
				const oreAmount = loot.amount(ore.id);
				miningXP += oreAmount * ore.xp;
				prayerXP += oreAmount * (ore.xp * 0.5);
			}
		} else {
			const oreLoot = miningTable.roll(quantity);
			loot.add(oreLoot);

			for (const ore of relevantOres) {
				const oreAmount = loot.amount(ore.id);
				miningXP += oreAmount * ore.xp;
			}
		}

		let bonusXP = 0;

		const prospectorPieces = [
			'Prospector helmet',
			'Prospector jacket',
			'Prospector legs',
			'Prospector boots'
		];

		const prospectorCount = prospectorPieces.filter(piece =>
			user.hasEquippedOrInBank(piece)
		).length;

		if (prospectorCount === 4) {
			const amountToAdd = Math.floor(miningXP * (2.5 / 100));
			miningXP += amountToAdd;
			bonusXP += amountToAdd;
		} else if (prospectorCount > 0) {
			const amountToAdd = Math.floor(miningXP * (prospectorCount * 0.5 / 100));
			miningXP += amountToAdd;
			bonusXP += amountToAdd;
		}

		// Apply Mining master cape multiply before adding rares so they aren't doubled
		if (user.hasEquippedOrInBank('Mining master cape')) {
			loot.multiply(2);
		}

		// Add rare drops after cape multiply so they are not affected
		if (miningType === 'dragonbone') {
			for (let i = 0; i < quantity; i++) {
				if (rng.roll(5000)) loot.add('Primordial heartstring');
				if (rng.roll(5000)) loot.add('Primordial spine');
			}
		} else {
			for (let i = 0; i < quantity; i++) {
				if (rng.roll(1000)) {
					loot.add(IslandGemTable5x.roll());
				} else if (rng.roll(500)) {
					loot.add(IslandGemTable3x.roll());
				} else if (rng.roll(100)) {
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

		if (bonusXP > 0) {
			str += `\n\n**Bonus Mining XP:** ${bonusXP.toLocaleString()}`;
		}

		if (loot.has('Primordial heartstring')) {
			str += '\n**You found a Primordial heartstring!**';
		}
		if (loot.has('Primordial spine')) {
			str += '\n**You found a Primordial spine!**';
		}

		const clueScrollChance = baseOre.clueScrollChance;
		if (clueScrollChance) {
			addSkillingClueToLoot(user, 'mining', quantity, clueScrollChance, loot);
		}

		const { petDropRate } = skillingPetDropRate(user, 'mining', baseOre.petChance);
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