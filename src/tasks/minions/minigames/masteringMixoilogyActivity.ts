import { SkillsEnum } from '../../../lib/skilling/types';
import type { MasteringMixologyCreatingTaskOptions } from '../../../lib/types/minions';
import { Bank } from 'oldschooljs';
import { mixologyHerbs } from '../../../mahoji/lib/abstracted_commands/masteringMixologyCommand';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const masteringMixologyCreateTask: MinionTask = {
	type: 'MasteringMixologyCreate',
	async run(data: MasteringMixologyCreatingTaskOptions) {
		const { userID, channelID, herbName, quantity, duration } = data;
		const user = await mUserFetch(userID);

		const herb = mixologyHerbs.find(h => h.name === herbName);
		if (!herb) {
			throw new Error(`Invalid herb used in MasteringMixologyCreate task: ${herbName}`);
		}

		const totalPaste = herb.quantity * quantity;
		const totalXP = quantity * 6;
		const pasteItemName = `${herb.paste} paste`;

		// Add paste to bank
		await user.addItemsToBank({
			items: new Bank().add(pasteItemName, totalPaste),
			collectionLog: false
		});

		// Add Herblore XP for creating paste
		await user.addXP({
			skillName: SkillsEnum.Herblore,
			amount: totalXP,
			duration,
			source: 'MasteringMixologyCreate'
		});

		const str = `${user.minionName} finished creating ${totalPaste}x ${pasteItemName} using ${quantity}x ${herb.name}. You gained ${totalXP} Herblore XP.`;

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};