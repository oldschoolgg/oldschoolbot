import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { incrementMinigameScore } from '../../../lib/settings/minigames';
import { SkillsEnum } from '../../../lib/skilling/types';
import type {
	MasteringMixologyContractActivityTaskOptions,
	MasteringMixologyContractCreatingTaskOptions
} from '../../../lib/types/minions';
import { randFloat } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import {
	getMixologyContractDuration,
	mixologyContracts,
	mixologyHerbs
} from '../../../mahoji/lib/abstracted_commands/masteringMixologyCommand';

export interface WeightedItem {
	weight: number;
	[key: string]: unknown;
}

export function masteringMixologyWeightedRandom<T extends WeightedItem>(items: readonly T[]): T {
	const total = items.reduce((sum, item) => sum + item.weight, 0);
	let roll = randFloat(0, total);
	for (const item of items) {
		roll -= item.weight;
		if (roll <= 0) return item;
	}
	return items[items.length - 1];
}

export const MixologyPasteCreationTask: MinionTask = {
	type: 'MixologyPasteCreation',
	async run(data: MasteringMixologyContractCreatingTaskOptions) {
		const { userID, channelID, herbName, quantity, duration } = data;
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
			skillName: SkillsEnum.Herblore,
			amount: totalXP,
			duration,
			source: 'MasteringMixology'
		});

		const str = `${user.minionName} finished creating ${totalPaste}x ${pasteItemName} using ${quantity}x ${herb.name}. You gained ${totalXP} Herblore XP.`;

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};

export const MasteringMixologyContractTask: MinionTask = {
	type: 'MasteringMixologyContract',
	run: async (data: MasteringMixologyContractActivityTaskOptions) => {
		const user = await mUserFetch(data.userID);
		let completed = 0;
		let totalXP = 0;
		let totalPoints = 0;
		let actualDuration = 0;

		const contractSummaries = new Map<string, { count: number; xp: number }>();
		const pasteUsage: Record<'Mox' | 'Lye' | 'Aga', number> = {
			Mox: 0,
			Lye: 0,
			Aga: 0
		};

		for (let i = 0; i < data.quantity; i++) {
			const availableContracts = mixologyContracts.filter(contract => {
				const counts: Record<'Mox' | 'Lye' | 'Aga', number> = { Mox: 0, Lye: 0, Aga: 0 };
				for (const p of contract.pasteSequence) counts[p]++;
				return Object.entries(counts).every(([p, c]) => user.bank.amount(`${p} paste`) >= c);
			});
			if (availableContracts.length === 0) break;

			const contract = masteringMixologyWeightedRandom(availableContracts);

			const cost = new Bank();
			for (const paste of contract.pasteSequence) {
				cost.add(`${paste} paste`);
				pasteUsage[paste] += 1;
			}

			if (!user.owns(cost)) continue;

			await user.removeItemsFromBank(cost);
			await updateBankSetting('mastering_mixology_cost_bank', cost);

			const contractXP = contract.xp;
			const contractPoints = contract.points;
			const contractDuration = getMixologyContractDuration(Time.Minute * 3);

			actualDuration += contractDuration;

			await user.addXP({ skillName: SkillsEnum.Herblore, amount: contractXP });
			await incrementMinigameScore(data.userID, 'mastering_mixology', 1);

			totalXP += contractXP;
			totalPoints += contractPoints;
			completed++;

			const existing = contractSummaries.get(contract.name);
			if (existing) {
				existing.count++;
				existing.xp += contractXP;
			} else {
				contractSummaries.set(contract.name, { count: 1, xp: contractXP });
			}
		}

		if (completed === 0) {
			return handleTripFinish(
				user,
				data.channelID,
				`${user.minionName} attempted to complete contracts but had insufficient paste.`,
				undefined,
				data,
				null
			);
		}

		const contractSummary = Array.from(contractSummaries.entries())
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([name, { count, xp }]) => `• ${count}x ${name} — ${xp} XP`)
			.join('\n');

		const pasteSummary = Object.entries(pasteUsage)
			.filter(([, count]) => count > 0)
			.map(([paste, count]) => `• ${count}x ${paste} paste`)
			.join('\n');

		const finalMsg = [
			`${user.minionName} completed ${completed} contract${completed === 1 ? '' : 's'}, earning ${totalXP} XP and ${totalPoints} points.`,
			'**Contracts Completed:**',
			contractSummary,
			'**Paste Used:**',
			pasteSummary
		].join('\n');

		return handleTripFinish(user, data.channelID, finalMsg, undefined, { ...data, duration: actualDuration }, null);
	}
};
