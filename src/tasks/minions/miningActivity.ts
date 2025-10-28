import { Emoji, Events, increaseNumByPercent, sumArr, Time } from '@oldschoolgg/toolkit';
import { toKMB } from 'oldschooljs';

import { QuestID } from '@/lib/minions/data/quests.js';
import addSkillingClueToLoot from '@/lib/minions/functions/addSkillingClueToLoot.js';
import Mining, { prospectorItemsArr } from '@/lib/skilling/skills/mining.js';
import type { Ore } from '@/lib/skilling/types.js';
import type { GearBank } from '@/lib/structures/GearBank.js';
import { UpdateBank } from '@/lib/structures/UpdateBank.js';
import type { MiningActivityTaskOptions } from '@/lib/types/minions.js';
import { rollForMoonKeyHalf } from '@/lib/util/minionUtils.js';
import { skillingPetDropRate } from '@/lib/util.js';

export function determineMiningResult({
	ore,
	quantity,
	gearBank,
	duration,
	isPowermining,
	hasFinishedCOTS,
	rng
}: {
	ore: Ore;
	quantity: number;
	gearBank: GearBank;
	duration: number;
	isPowermining: boolean;
	hasFinishedCOTS: boolean;
	rng: RNGProvider;
}) {
	const miningLvl = gearBank.skillsAsLevels.mining;
	let bonusXP = 0;
	let xpToReceive = quantity * ore.xp;

	let taintedQty = 0; // 6xp per chunk rolled
	if (ore.name === 'Tainted essence chunk') {
		for (let i = 0; i < quantity; i++) {
			taintedQty += rng.randInt(1, 4);
		}
		xpToReceive = taintedQty * ore.xp;
	}

	const equippedProsItems = prospectorItemsArr.filter(item => gearBank.hasEquipped(item.id));
	const bonusPercent =
		equippedProsItems.length === 4 ? 2.5 : sumArr(equippedProsItems.map(item => item.boostPercent));
	if (bonusPercent > 0) {
		const newXP = Math.floor(increaseNumByPercent(xpToReceive, bonusPercent));
		bonusXP = newXP - xpToReceive;
		xpToReceive = newXP;
	}

	const updateBank = new UpdateBank();
	if (ore.xp) {
		updateBank.xpBank.add('mining', xpToReceive, { duration });
	}

	const xpHr = toKMB((xpToReceive / (duration / Time.Minute)) * 60).toLocaleString();

	// Add clue scrolls
	if (ore.clueScrollChance) {
		addSkillingClueToLoot(gearBank, 'mining', quantity, ore.clueScrollChance, updateBank.itemLootBank);
	}

	// Roll for pet
	if (ore.petChance) {
		const { petDropRate } = skillingPetDropRate(gearBank, 'mining', ore.petChance);
		if (rng.roll(Math.ceil(petDropRate / quantity))) {
			updateBank.itemLootBank.add('Rock golem');
		}
	}

	const numberOfMinutes = duration / Time.Minute;

	if (numberOfMinutes > 10 && ore.minerals && miningLvl >= 60) {
		let numberOfMinerals = 0;
		for (let i = 0; i < quantity; i++) {
			if (rng.roll(ore.minerals)) numberOfMinerals++;
		}

		if (numberOfMinerals > 0) {
			updateBank.itemLootBank.add('Unidentified minerals', numberOfMinerals);
		}
	}

	if (ore.name === 'Daeyalt essence rock') {
		let daeyaltQty = 0;
		for (let i = 0; i < quantity; i++) {
			daeyaltQty += rng.randInt(2, 3);
		}
		updateBank.itemLootBank.add(ore.id, daeyaltQty);
	} else if (!isPowermining) {
		// Gem rocks roll off the GemRockTable
		if (ore.name === 'Gem rock') {
			for (let i = 0; i < quantity; i++) {
				updateBank.itemLootBank.add(Mining.GemRockTable.roll());
			}
		} else if (ore.name === 'Volcanic ash') {
			// Volcanic ash
			const tiers = [
				[22, 1],
				[37, 2],
				[52, 3],
				[67, 4],
				[82, 5],
				[97, 6]
			];
			for (const [lvl, multiplier] of tiers.reverse()) {
				if (miningLvl >= lvl) {
					updateBank.itemLootBank.add(ore.id, quantity * multiplier);
					break;
				}
			}
		} else if (ore.name === 'Sandstone') {
			// Sandstone roll off the SandstoneRockTable
			for (let i = 0; i < quantity; i++) {
				updateBank.itemLootBank.add(Mining.SandstoneRockTable.roll());
			}
		} else if (ore.name === 'Granite') {
			// Granite roll off the GraniteRockTable
			for (let i = 0; i < quantity; i++) {
				updateBank.itemLootBank.add(Mining.GraniteRockTable.roll());
			}
		} else if (ore.name === 'Tainted essence chunk') {
			updateBank.itemLootBank.add(ore.id, 5 * taintedQty);
		} else {
			updateBank.itemLootBank.add(ore.id, quantity);
		}
	}

	if (ore.name === 'Runite ore') {
		rollForMoonKeyHalf({ user: hasFinishedCOTS, duration, loot: updateBank.itemLootBank, rng });
	}

	return {
		updateBank,
		bonusXP,
		xpHr
	};
}

export const miningTask: MinionTask = {
	type: 'Mining',
	async run(data: MiningActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { oreID, channelID, duration, powermine } = data;
		const { quantity } = data;

		const ore = Mining.Ores.find(ore => ore.id === oreID)!;
		const { updateBank, bonusXP } = determineMiningResult({
			ore,
			quantity,
			gearBank: user.gearBank,
			duration,
			isPowermining: powermine,
			hasFinishedCOTS: user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun),
			rng
		});

		const updateResult = await updateBank.transact(user);
		if (typeof updateResult === 'string') throw new Error(updateResult);
		let str = `${user}, ${user.minionName} finished mining ${quantity} ${ore.name}. ${updateResult.message}${
			bonusXP > 0 ? ` **Bonus XP:** ${bonusXP.toLocaleString()}` : ''
		}\n`;

		if (updateResult.itemTransactionResult?.itemsAdded)
			str += `\nYou received ${updateResult.itemTransactionResult?.itemsAdded}.`;

		if (updateBank.itemLootBank.has('Rock golem')) {
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Mining} **${user.badgedUsername}'s** minion, ${user.minionName}, just received a Rock golem while mining ${ore.name} at level ${user.skillsAsLevels.mining} Mining!`
			);
		}

		handleTripFinish(user, channelID, str, undefined, data, updateResult.itemTransactionResult?.itemsAdded ?? null);
	}
};
