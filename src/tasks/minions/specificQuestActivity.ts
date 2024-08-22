import { bold } from 'discord.js';

import { quests } from '../../lib/minions/data/quests';
import { SkillsEnum } from '../../lib/skilling/types';
import type { SpecificQuestOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const specificQuestTask: MinionTask = {
	type: 'SpecificQuest',
	async run(data: SpecificQuestOptions) {
		const { userID, channelID, questID } = data;
		const user = await mUserFetch(userID);
		const quest = quests.find(quest => quest.id === questID)!;

		let completionMessage = `${user}, ${user.minionName} finished ${bold(quest.name)}.`;

		if (quest.rewards) {
			await user.addItemsToBank({ items: quest.rewards, collectionLog: true });
			completionMessage += ` You received ${quest.rewards}.`;
		}

		if (quest.skillsRewards) {
			for (const [skillName, amount] of Object.entries(quest.skillsRewards)) {
				if (Object.values(SkillsEnum).includes(skillName as SkillsEnum)) {
					await user.addXP({ skillName: skillName as SkillsEnum, amount });
				}
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

		handleTripFinish(user, channelID, completionMessage, undefined, data, null);
	}
};
