import { Time, increaseNumByPercent, randInt, roll, sumArr } from 'e';

import { Emoji, Events } from '../../lib/constants';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Mining, { prospectorItemsArr } from '../../lib/skilling/skills/mining';
import { type Ore, SkillsEnum } from '../../lib/skilling/types';
import type { GearBank } from '../../lib/structures/GearBank';
import { UpdateBank } from '../../lib/structures/UpdateBank';
import type { MiningActivityTaskOptions } from '../../lib/types/minions';
import { skillingPetDropRate, toKMB } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export function determineMiningResult({
	ore,
	quantity,
	gearBank,
	duration,
	isPowermining
}: { ore: Ore; quantity: number; gearBank: GearBank; duration: number; isPowermining: boolean }) {
	const miningLvl = gearBank.skillsAsLevels.mining;
	const messages: string[] = [];
	let xpToReceive = quantity * ore.xp;

	const equippedProsItems = prospectorItemsArr.filter(item => gearBank.hasEquipped(item.id));
	const bonusPercent =
		equippedProsItems.length === 4 ? 2.5 : sumArr(equippedProsItems.map(item => item.boostPercent));
	if (bonusPercent > 0) {
		const newXP = Math.floor(increaseNumByPercent(xpToReceive, bonusPercent));
		messages.push(`${bonusPercent}% (${newXP - xpToReceive}) XP for prospector`);
		xpToReceive = newXP;
	}

	const updateBank = new UpdateBank();
	if (ore.xp) {
		updateBank.xpBank.add('mining', xpToReceive, { duration });
	}

	const xpHr = toKMB((xpToReceive / (duration / Time.Minute)) * 60).toLocaleString();

	// Add clue scrolls
	if (ore.clueScrollChance) {
		addSkillingClueToLoot(gearBank, SkillsEnum.Mining, quantity, ore.clueScrollChance, updateBank.itemLootBank);
	}

	// Roll for pet
	if (ore.petChance) {
		const { petDropRate } = skillingPetDropRate(gearBank, SkillsEnum.Mining, ore.petChance);
		if (roll(petDropRate / quantity)) {
			updateBank.itemLootBank.add('Rock golem');
			messages.push("You have a funny feeling you're being followed...");
		}
	}

	const numberOfMinutes = duration / Time.Minute;

	if (numberOfMinutes > 10 && ore.minerals && miningLvl >= 60) {
		let numberOfMinerals = 0;
		for (let i = 0; i < quantity; i++) {
			if (roll(ore.minerals)) numberOfMinerals++;
		}

		if (numberOfMinerals > 0) {
			updateBank.itemLootBank.add('Unidentified minerals', numberOfMinerals);
		}
	}

	let daeyaltQty = 0;

	if (!isPowermining) {
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
		} else if (ore.name === 'Daeyalt essence rock') {
			for (let i = 0; i < quantity; i++) {
				daeyaltQty += randInt(2, 3);
			}
			updateBank.itemLootBank.add(ore.id, daeyaltQty);
		} else {
			updateBank.itemLootBank.add(ore.id, quantity);
		}
	}

	return {
		updateBank,
		messages,
		xpHr
	};
}

export const miningTask: MinionTask = {
	type: 'Mining',
	async run(data: MiningActivityTaskOptions) {
		const { oreID, userID, channelID, duration, powermine } = data;
		const { quantity } = data;
		const user = await mUserFetch(userID);
		const ore = Mining.Ores.find(ore => ore.id === oreID)!;

		const { updateBank, messages, xpHr } = determineMiningResult({
			ore,
			quantity,
			gearBank: user.gearBank,
			duration,
			isPowermining: powermine
		});

		const updateResult = await updateBank.transact(user);
		if (typeof updateResult === 'string') throw new Error(updateResult);
		let str = `${user}, ${user.minionName} finished mining ${quantity} ${ore.name}. `;
		if (!powermine) str += `You received ${updateResult.itemTransactionResult?.itemsAdded} and `;

		str += `${updateBank.xpBank}. ${xpHr} XP/hr`;
		if (messages.length > 0) {
			str += `\n${messages.join(', ')}.`;
		}

		if (updateBank.itemLootBank.has('Rock golem')) {
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Mining} **${user.badgedUsername}'s** minion, ${user.minionName}, just received a Rock golem while mining ${ore.name} at level ${user.skillsAsLevels.mining} Mining!`
			);
		}

		handleTripFinish(user, channelID, str, undefined, data, updateResult.itemTransactionResult?.itemsAdded ?? null);
	}
};
