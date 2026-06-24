import type { BrimstoneDistilleryTaskOptions } from '@/lib/bso/bsoTypes.js';
import { calculateDistilleryResult } from '@/lib/bso/minigames/brimstoneDistillery.js';

export const brimstoneDistilleryTask: MinionTask = {
	type: 'BrimstoneDistillery',
	async run(data: BrimstoneDistilleryTaskOptions, { user, handleTripFinish }) {
		const { quantity, channelId, duration, recipe } = data;

		const result = calculateDistilleryResult(data);
		const { loot, herbloreXP, flavorMessage, failedDistillations } = result;

		const { newScore } = await user.incrementMinigameScore('brimstone_distillery', 1);

		await user.addItemsToBank({ items: loot, collectionLog: true });

		const xpResults = await user.addXP({ skillName: 'herblore', amount: herbloreXP, duration, minimal: true });

		const existing = (user.user.distillery_stats ?? {}) as Record<string, number>;
		await user.update({
			distillery_stats: {
				totalDistillations: (existing.totalDistillations ?? 0) + data.quantity,
				totalPotions: (existing.totalPotions ?? 0) + loot.amount(result.recipe.output.id),
				totalFailed: (existing.totalFailed ?? 0) + failedDistillations,
				tripsCompleted: (existing.tripsCompleted ?? 0) + 1
			}
		});

		return handleTripFinish({
			user,
			channelId,
			message: `${user}, your minion finished distilling ${quantity}x ${recipe} at the Brimstone Distillery.\n**Your Brimstone Distillery KC is now ${newScore}**.\n\n${loot}\n\n${xpResults}${flavorMessage}`,
			data,
			loot
		});
	}
};
