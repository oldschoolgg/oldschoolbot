import type { ConstructionContractsTaskOptions } from '@/lib/bso/bsoTypes.js';
import { calculateContractsResult } from '@/lib/bso/minigames/constructionContracts.js';

export const constructionContractsTask: MinionTask = {
	type: 'ConstructionContracts',
	async run(data: ConstructionContractsTaskOptions, { user, handleTripFinish }) {
		const { quantity, channelId, duration, recipe } = data;

		const { loot, constructionXP, flavorMessage } = calculateContractsResult(data);

		const { newScore } = await user.incrementMinigameScore('construction_contracts', 1);

		await user.addItemsToBank({ items: loot, collectionLog: true });

		const xpResults = await user.addXP({ skillName: 'construction', amount: constructionXP, duration, minimal: true });

		return handleTripFinish({
			user,
			channelId,
			message: `${user}, your minion finished crafting ${quantity}x ${recipe} at Construction Contracts.\n**Your Construction Contracts KC is now ${newScore}**.\n\n${loot}\n\n${xpResults}${flavorMessage}`,
			data,
			loot
		});
	}
};