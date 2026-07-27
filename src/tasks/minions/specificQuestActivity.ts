import { bold } from '@oldschoolgg/discord';

import { quests } from '@/lib/minions/data/quests.js';
import type { SkillNameType } from '@/lib/skilling/types.js';
import type { SpecificQuestOptions } from '@/lib/types/minions.js';

export const specificQuestTask: MinionTask = {
	type: 'SpecificQuest',
	async run(data: SpecificQuestOptions, { user, handleTripFinish }) {
		const { channelId, questID } = data;

		const quest = quests.find(quest => quest.id === questID)!;

		let completionMessage = `${user}, ${user.minionName} finished ${bold(quest.name)}.`;

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

		handleTripFinish({ user, channelId, message: completionMessage, data });
	}
};
