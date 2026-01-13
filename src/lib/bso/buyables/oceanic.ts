import type { Buyable } from '@/lib/data/buyables/buyables.js';

const oceanicShroudsRaw = [
	['Oceanic shroud (tier 1)', 100],
	['Oceanic shroud (tier 2)', 250],
	['Oceanic shroud (tier 3)', 500],
	['Oceanic shroud (tier 4)', 750],
	['Oceanic shroud (tier 5)', 1000]
] as const;

export const oceanicShroudsBuyables: Buyable[] = [];

for (const [name, kcReq] of oceanicShroudsRaw) {
	oceanicShroudsBuyables.push({
		name,
		gpCost: kcReq * 10,
		customReq: async (user: MUser) => {
			const minigames = await user.fetchMinigames();
			return minigames.depths_of_atlantis + minigames.depths_of_atlantis_cm >= kcReq
				? [true]
				: [false, `You need ${kcReq} Normal/CM Depths of Atlantis KCs to buy this.`];
		}
	});
}
