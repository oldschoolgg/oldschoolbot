import { Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import type {
	MasteringMixologyContractActivityTaskOptions,
	MasteringMixologyContractCreatingTaskOptions
} from '../../../lib/types/minions.js';
import { handleTripFinish } from '../../../lib/util/handleTripFinish.js';
import type { MixologyPaste } from '../../../mahoji/lib/abstracted_commands/masteringMixologyCommand.js';
import {
	calcMixologyContractBasePoints,
	calcMixologyHandInPoints,
	getMixologyContractDuration,
	mixologyContracts,
	mixologyHerbs
} from '../../../mahoji/lib/abstracted_commands/masteringMixologyCommand.js';

export interface WeightedItem {
	weight: number;
}

export function masteringMixologyWeightedRandom<T extends WeightedItem>(items: readonly T[]): T {
	const total = items.reduce((sum, item) => sum + item.weight, 0);
	let roll = Math.random() * total;
	for (const item of items) {
		if (roll < item.weight) return item;
		roll -= item.weight;
	}
	return items[0];
}

export const MixologyPasteCreationTask: MinionTask = {
	type: 'MixologyPasteCreation',
	async run(data: MasteringMixologyContractCreatingTaskOptions) {
		const { userID, channelId, herbName, quantity, duration } = data;
		const user = await mUserFetch(userID);

		const herb = mixologyHerbs.find(h => h.name.toLowerCase() === herbName.toLowerCase());
		if (!herb) {
			throw new Error(`Invalid herb used in MixologyPasteCreation task: ${herbName}`);
		}

		const totalPaste = herb.quantity * quantity;
		const totalXP = quantity * 6;
		const pasteItemName = `${herb.paste} paste`;

		// Add paste to bank
		await user.addItemsToBank({
			items: new Bank().add(pasteItemName, totalPaste),
			collectionLog: true
		});

		// Add Herblore XP for creating paste
		await user.addXP({
			skillName: 'herblore',
			amount: totalXP,
			duration,
			source: 'MasteringMixology'
		});

		const str = `${user.minionName} finished creating ${totalPaste}x ${pasteItemName} using ${quantity}x ${herb.name}. You gained ${totalXP} Herblore XP.`;

		handleTripFinish({ user, channelId, message: str, data });
	}
};

export const MasteringMixologyContractTask: MinionTask = {
	type: 'MasteringMixologyContract',
	run: async (data: MasteringMixologyContractActivityTaskOptions) => {
		const { userID, channelId, quantity } = data;
		const user = await mUserFetch(userID);
		let completed = 0;
		let totalXP = 0;
		const pointsEarned: Record<MixologyPaste, number> = {
			Mox: 0,
			Lye: 0,
			Aga: 0
		};
		let totalPoints = 0;
		let actualDuration = 0;
		const contractBaseRate = Time.Hour / 343;
		let currentHandInBatch: Record<MixologyPaste, number>[] = [];

		const addHandInBatchPoints = () => {
			if (currentHandInBatch.length === 0) return;

			const batchPoints = calcMixologyHandInPoints(currentHandInBatch);
			pointsEarned.Mox += batchPoints.Mox;
			pointsEarned.Lye += batchPoints.Lye;
			pointsEarned.Aga += batchPoints.Aga;
			totalPoints += batchPoints.Mox + batchPoints.Lye + batchPoints.Aga;
			currentHandInBatch = [];
		};

		const pasteUsage: Record<MixologyPaste, number> = {
			Mox: 0,
			Lye: 0,
			Aga: 0
		};

		const currentLevel = user.skillLevel('herblore');
		for (let i = 0; i < quantity; i++) {
			const currentBank = user.bank.clone();

			const availableContracts = mixologyContracts.filter(contract => {
				const counts: Record<MixologyPaste, number> = { Mox: 0, Lye: 0, Aga: 0 };
				for (const p of contract.pasteSequence) counts[p] += 10;
				return (
					currentLevel >= contract.requiredLevel &&
					Object.entries(counts).every(([p, c]) => currentBank.amount(`${p} paste`) >= c)
				);
			});

			if (availableContracts.length === 0) break;

			const contract = masteringMixologyWeightedRandom(availableContracts);

			const cost = new Bank();
			for (const paste of contract.pasteSequence) {
				cost.add(`${paste} paste`, 10);
			}

			if (!user.owns(cost)) continue;

			await user.removeItemsFromBank(cost);
			await ClientSettings.updateBankSetting('mastering_mixology_cost_bank', cost);

			for (const paste of contract.pasteSequence) {
				pasteUsage[paste] += 10;
			}

			currentHandInBatch.push(calcMixologyContractBasePoints(contract.pasteSequence));
			if (currentHandInBatch.length === 3) addHandInBatchPoints();

			const contractDuration = getMixologyContractDuration(contractBaseRate);

			actualDuration += contractDuration;

			await user.incrementMinigameScore('mastering_mixology', 1);

			totalXP += contract.xp;
			completed++;
		}
		addHandInBatchPoints();

		if (completed === 0) {
			return handleTripFinish({
				user,
				channelId,
				message: `${user.minionName} attempted to complete contracts but had insufficient paste.`,
				data
			});
		}

		const pasteSummary = Object.entries(pasteUsage)
			.filter(([, count]) => count > 0)
			.map(([paste, count]) => `${count}x ${paste} paste`)
			.join(', ');

		const xpRes = await user.addXP({
			skillName: 'herblore',
			amount: totalXP,
			duration: actualDuration,
			source: 'MasteringMixology'
		});

		await user.update({
			mixology_mox_points: { increment: pointsEarned.Mox },
			mixology_aga_points: { increment: pointsEarned.Aga },
			mixology_lye_points: { increment: pointsEarned.Lye }
		});

		const pointsEntries = Object.entries(pointsEarned).filter(([, val]) => val > 0);

		const pointsInline = pointsEntries.map(([paste, val]) => `${val} ${paste} points`).join(', ');

		const finalMsg = [
			`${user.minionName} completed ${completed} contract${completed === 1 ? '' : 's'}, earning ${totalPoints} points (${pointsInline}). ${xpRes}`,
			`**Paste Used:** ${pasteSummary}`
		].join('\n');

		return handleTripFinish({ user, channelId, message: finalMsg, data });
	}
};
