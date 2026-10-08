import { bold } from '@oldschoolgg/discord';

import { MAX_QP, quests } from '@/lib/minions/data/quests.js';
import type { SkillNameType } from '@/lib/skilling/types.js';
import type { SpecificQuestOptions } from '@/lib/types/minions.js';

export const specificQuestTask: MinionTask = {
	type: 'SpecificQuest',
	async run(data: SpecificQuestOptions, { user, handleTripFinish }) {
		const { channelId, questID } = data;

		const quest = quests.find(quest => quest.id === questID)!;
		const newQP = user.QP + quest.qp;
		const questPointText = `${quest.qp.toLocaleString()} quest point${quest.qp === 1 ? '' : 's'}`;

		let completionMessage = `${user}, ${user.minionName} finished ${bold(quest.name)}, you received ${questPointText}. Your new total is ${newQP.toLocaleString()} quest points.`;

		if (quest.rewards) {
			await user.transactItems({ itemsToAdd: quest.rewards, collectionLog: true });
			completionMessage += ` You received ${quest.rewards}.`;
		}

		if (quest.skillsRewards) {
			for (const [skillName, amount] of Object.entries(quest.skillsRewards) as [SkillNameType, number][]) {
				await user.addXP({ skillName: skillName as SkillNameType, amount });
			}
			completionMessage += ` You gained the following skills rewards: ${Object.entries(quest.skillsRewards)
				.map(([skill, xp]) => `${xp} XP in ${skill}`)
				.join(', ')}.`;
		}

		await user.update({
			finished_quest_ids: {
				push: quest.id
			},
			QP: {
				increment: quest.qp
			}
		});

		if (newQP >= MAX_QP) {
			completionMessage += `\n\nYou have achieved the maximum amount of ${MAX_QP} Quest Points!`;
		}

		handleTripFinish({ user, channelId, message: completionMessage, data });
	}
};
