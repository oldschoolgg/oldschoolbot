import type { Invention } from '@/lib/bso/skills/invention/inventions.js';
import { inventionsCanUnlockFromResearch } from '@/lib/bso/skills/invention/research.js';

import { roll, shuffleArr } from '@oldschoolgg/rng';
import { bold, userMention } from 'discord.js';

import type { ResearchTaskOptions } from '@/lib/types/minions.js';

export const researchActivityTask: MinionTask = {
	type: 'Research',
	async run(data: ResearchTaskOptions, { user, handleTripFinish }) {
		const { material, quantity } = data;

		const inventionToTryUnlock: Invention | null =
			shuffleArr(inventionsCanUnlockFromResearch(user, data.material))[0] ?? null;
		let unlockedBlueprint: Invention | null = null;

		for (let i = 0; i < quantity; i++) {
			if (!roll(1000)) continue;
			unlockedBlueprint = inventionToTryUnlock;
		}

		let discoveredStr =
			unlockedBlueprint === null
				? "You didn't discover or find anything."
				: `You found the blueprint for the '${unlockedBlueprint.name}'!`;
		if (unlockedBlueprint) {
			if (user.user.unlocked_blueprints.includes(unlockedBlueprint.id)) {
				discoveredStr = `You found a ${unlockedBlueprint.name} blueprint, but you already know how to make it!`;
			} else {
				await user.update({
					unlocked_blueprints: {
						push: unlockedBlueprint.id
					}
				});
			}
			discoveredStr = bold(discoveredStr);
		}

		const xpStr = await user.addXP({
			skillName: 'invention',
			amount: quantity * 56.39,
			duration: data.duration,
			multiplier: false,
			masterCapeBoost: true
		});
		const str = `${userMention(data.userID)}, ${user.minionName} finished researching with ${quantity}x ${material} materials.
${discoveredStr}
${xpStr}`;

		handleTripFinish(user, data.channelID, str, undefined, data, null);
	}
};
