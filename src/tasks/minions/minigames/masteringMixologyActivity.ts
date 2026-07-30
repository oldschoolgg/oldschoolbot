import { Bank } from 'oldschooljs';

import type { MixologyPoints } from '../../../lib/minions/data/masteringMixology.js';
import {
	calcMixologyContractBasePoints,
	calcMixologyHandInPoints,
	createMixologyPoints,
	getMixologyContractCost,
	getMixologyContractDuration,
	masteringMixologyWeightedRandom,
	mixologyContractBatchSize,
	mixologyContractDuration,
	mixologyContracts,
	mixologyHerbs,
	mixologyPastePerPotionStep
} from '../../../lib/minions/data/masteringMixology.js';
import type {
	MasteringMixologyContractActivityTaskOptions,
	MasteringMixologyContractCreatingTaskOptions
} from '../../../lib/types/minions.js';
import { handleTripFinish } from '../../../lib/util/handleTripFinish.js';

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

		await user.addItemsToBank({
			items: new Bank().add(pasteItemName, totalPaste),
			collectionLog: true
		});

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
	run: async (data: MasteringMixologyContractActivityTaskOptions, options?: Parameters<MinionTask['run']>[1]) => {
		const { userID, channelId, quantity } = data;
		const user = await mUserFetch(userID);
		const tripFinish = options?.handleTripFinish ?? handleTripFinish;
		let completed = 0;
		let totalXP = 0;
		const pointsEarned = createMixologyPoints();
		let totalPoints = 0;
		let actualDuration = 0;
		let currentHandInBatch: MixologyPoints[] = [];
		const totalCost = new Bank();

		const addHandInBatchPoints = () => {
			if (currentHandInBatch.length === 0) return;

			const batchPoints = calcMixologyHandInPoints(currentHandInBatch);
			pointsEarned.Mox += batchPoints.Mox;
			pointsEarned.Lye += batchPoints.Lye;
			pointsEarned.Aga += batchPoints.Aga;
			totalPoints += batchPoints.Mox + batchPoints.Lye + batchPoints.Aga;
			currentHandInBatch = [];
		};

		const pasteUsage = createMixologyPoints();

		const currentLevel = user.skillLevel('herblore');
		for (let i = 0; i < quantity; i++) {
			const currentBank = user.bank.clone();

			const availableContracts = mixologyContracts.filter(contract => {
				return (
					currentLevel >= contract.requiredLevel &&
					currentBank.has(getMixologyContractCost(contract.pasteSequence))
				);
			});

			if (availableContracts.length === 0) break;

			const contract = masteringMixologyWeightedRandom(availableContracts);
			const cost = getMixologyContractCost(contract.pasteSequence);

			if (!user.owns(cost)) continue;

			await user.removeItemsFromBank(cost);
			totalCost.add(cost);

			for (const paste of contract.pasteSequence) {
				pasteUsage[paste] += mixologyPastePerPotionStep;
			}

			currentHandInBatch.push(calcMixologyContractBasePoints(contract.pasteSequence));
			if (currentHandInBatch.length === mixologyContractBatchSize) addHandInBatchPoints();

			const contractDuration = getMixologyContractDuration(mixologyContractDuration);

			actualDuration += contractDuration;

			totalXP += contract.xp;
			completed++;
		}
		addHandInBatchPoints();

		if (completed === 0) {
			return tripFinish({
				user,
				channelId,
				message: `${user.minionName} attempted to complete contracts but had insufficient paste.`,
				data
			});
		}

		await ClientSettings.updateBankSetting('mastering_mixology_cost_bank', totalCost);
		await user.incrementMinigameScore('mastering_mixology', completed);

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

		return tripFinish({ user, channelId, message: finalMsg, data });
	}
};
