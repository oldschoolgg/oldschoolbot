import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { incrementMinigameScore } from '../../../lib/settings/minigames';
import { SkillsEnum } from '../../../lib/skilling/types';
import type {
	MasteringMixologyContractActivityTaskOptions,
	MasteringMixologyContractCreatingTaskOptions
} from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import {
	getMixologyContractDuration,
	mixologyContracts,
	mixologyHerbs
} from '../../../mahoji/lib/abstracted_commands/masteringMixologyCommand';

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

		const summary: string[] = [];

		for (let i = 0; i < data.quantity; i++) {
			const availableContracts = mixologyContracts.filter(contract =>
				contract.pasteSequence.every(paste => user.bank.amount(`${paste} paste`) >= 1)
			);
			if (availableContracts.length === 0) break;

			const contract = availableContracts[Math.floor(Math.random() * availableContracts.length)];

			const cost = new Bank();
			for (const paste of contract.pasteSequence) {
				cost.add(`${paste} paste`);
			}

			if (!user.owns(cost)) break;

			await user.removeItemsFromBank(cost);
			await updateBankSetting('mastering_mixology_cost_bank', cost);

			const contractXP = contract.xp;
			const contractPoints = contract.points;
			const contractDuration = getMixologyContractDuration(Time.Minute * 3); // Match what you use in the start command

			actualDuration += contractDuration;

			await user.addXP({ skillName: SkillsEnum.Herblore, amount: contractXP });
			await incrementMinigameScore(data.userID, 'mastering_mixology', 1);

			totalXP += contractXP;
			totalPoints += contractPoints;
			completed++;
			summary.push(`• ${contract.name} — ${contractXP} XP`);
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

		return handleTripFinish(
			user,
			data.channelID,
			`${user.minionName} completed ${completed} contract${completed === 1 ? '' : 's'}, earning ${totalXP} XP and ${totalPoints} points.\n${summary.join('\n')}`,
			undefined,
			{ ...data, duration: actualDuration },
			null
		);
	}
};
