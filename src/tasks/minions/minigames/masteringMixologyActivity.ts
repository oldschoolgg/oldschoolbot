import { Bank } from 'oldschooljs';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { MasteringMixologyContractCreatingTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { mixologyHerbs } from '../../../mahoji/lib/abstracted_commands/masteringMixologyCommand';

export const MixologyPasteCreationTask: MinionTask = {
	type: 'MixologyPasteCreation',
	async run(data: MasteringMixologyContractCreatingTaskOptions) {
		const { userID, channelID, herbName, quantity, duration } = data;
		const user = await mUserFetch(userID);

		const herb = mixologyHerbs.find(h => h.name === herbName);
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
			source: 'MixologyPasteCreation'
		});

		const str = `${user.minionName} finished creating ${totalPaste}x ${pasteItemName} using ${quantity}x ${herb.name}. You gained ${totalXP} Herblore XP.`;

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};

export const MasteringMixologyContract: MinionTask = {
	type: 'MasteringMixologyContract',
	run: async () => {
		console.log('MasteringMixologyContract task ran (stub)');
		// TODO: Implement actual logic
	}
};
