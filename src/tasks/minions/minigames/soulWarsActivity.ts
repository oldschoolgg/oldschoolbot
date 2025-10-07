import { increaseNumByPercent, reduceNumByPercent } from '@oldschoolgg/toolkit';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

function calcPoints(rng: RNGProvider) {
	let base = 42.5;
	if (rng.roll(5)) {
		base = 30;
	}
	if (rng.roll(15)) {
		base = 10;
	}
	if (rng.roll(2)) {
		base = increaseNumByPercent(base, 20);
	} else {
		base = reduceNumByPercent(base, 20);
	}
	return Math.ceil(base);
}

export const soulWarsTask: MinionTask = {
	type: 'SoulWars',
	async run(data: MinigameActivityTaskOptionsWithNoChanges, { user, handleTripFinish, rng }) {
		const { channelID, quantity, duration } = data;

		let points = 0;
		for (let i = 0; i < quantity; i++) {
			points += calcPoints(rng);
		}

		const flappyRes = await user.hasFlappy(duration);
		if (flappyRes.shouldGiveBoost) {
			points *= 2;
		}

		await user.update({
			zeal_tokens: {
				increment: points
			}
		});

		await user.incrementMinigameScore('soul_wars', quantity);

		let str = `${user}, ${user.minionName} finished doing ${quantity}x games of Soul Wars, you received ${points} Zeal Tokens, you now have ${user.user.zeal_tokens}.\n\n`;
		if (flappyRes.shouldGiveBoost) str += `\n${flappyRes.userMsg}`;

		handleTripFinish(user, channelID, str, undefined!, data, null);
	}
};
