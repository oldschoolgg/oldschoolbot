import type { BrimstoneDistilleryTaskOptions } from '@/lib/bso/bsoTypes.js';
import { calculateDistilleryResult } from '@/lib/bso/minigames/brimstoneDistillery.js';

export const brimstoneDistilleryTask: MinionTask = {
	type: 'BrimstoneDistillery',
	async run(data: BrimstoneDistilleryTaskOptions, { user, handleTripFinish }) {
		const { quantity, channelId, duration, recipe } = data;

		const { loot, herbloreXP, flavorMessage } = calculateDistilleryResult(data);

		const { newScore } = await user.incrementMinigameScore('brimstone_distillery', 1);

		await user.addItemsToBank({ items: loot, collectionLog: true });

		const xpResults = await user.addXP({ skillName: 'herblore', amount: herbloreXP, duration, minimal: true });

		return handleTripFinish({
            user,
            channelId,
            message: `${user}, your minion finished distilling ${quantity}x ${recipe} at the Brimstone Distillery.\n**Your Brimstone Distillery KC is now ${newScore}**.\n\n${loot}\n\n${xpResults}${flavorMessage}`,
            data,
            loot
		});
	}
};