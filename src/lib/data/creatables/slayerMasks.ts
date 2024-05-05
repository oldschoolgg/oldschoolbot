import { Bank } from 'oldschooljs';

import { SlayerTaskUnlocksEnum } from '../../slayer/slayerUnlocks';
import { ItemBank } from '../../types';
import { Createable } from '../createables';
import { slayerMaskHelms } from '../slayerMaskHelms';

export const slayerMaskCreatables: Createable[] = [];
for (const { mask, helm, monsters, killsRequiredForUpgrade } of slayerMaskHelms) {
	slayerMaskCreatables.push({
		name: helm.name,
		inputItems: new Bank().add('Slayer helmet').add(mask.id),
		requiredSlayerUnlocks: [SlayerTaskUnlocksEnum.Maskuerade],
		outputItems: new Bank().add(helm.id),
		customReq: async user => {
			const stats = await user.fetchStats({ on_task_with_mask_monster_scores: true });
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
