import { slayerMaskHelms } from '@/lib/bso/slayerMaskHelms.js';

import { Bank, type ItemBank } from 'oldschooljs';

import type { Createable } from '@/lib/data/createables.js';
import { SlayerTaskUnlocksEnum } from '@/lib/slayer/slayerUnlocks.js';

export const slayerMaskCreatables: Createable[] = [];
for (const { mask, helm, monsters, killsRequiredForUpgrade } of slayerMaskHelms) {
	slayerMaskCreatables.push({
		name: helm.name,
		inputItems: new Bank().add('Slayer helmet').add(mask.id),
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.Maskuerade],
		outputItems: new Bank().add(helm.id),
		customReq: async user => {
			const stats = await user.fetchStats();
			const scores: ItemBank = stats.on_task_with_mask_monster_scores as ItemBank;
			let totalKC = 0;
			for (const id of monsters) {
				totalKC += scores[id] ?? 0;
			}
			if (totalKC < killsRequiredForUpgrade) {
				return `You need to kill atleast ${killsRequiredForUpgrade} on your ${mask.name} to upgrade it into a ${helm.name}, you have ${totalKC}.`;
			}
			return null;
		}
	});
}
