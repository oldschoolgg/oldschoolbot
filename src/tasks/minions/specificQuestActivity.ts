import { bold } from 'discord.js';

import { SkillsEnum } from '../../lib/skilling/types';
import type { SpecificQuestOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { quests } from '../../lib/util/specificQuests';

export const specificQuestTask: MinionTask = {
	type: 'SpecificQuest',
	async run(data: SpecificQuestOptions) {
		const { userID, channelID, questID } = data;
		const user = await mUserFetch(userID);
		const quest = quests.find(quest => quest.id === questID)!;

		if (quest.rewards) {
			await user.addItemsToBank({ items: quest.rewards, collectionLog: true });
		}

		if (quest.skillsRewards) {
			for (const [skillName, amount] of Object.entries(quest.skillsRewards)) {
				if (Object.values(SkillsEnum).includes(skillName as SkillsEnum)) {
					await user.addXP({ skillName: skillName as SkillsEnum, amount });
				}
			}
		}

		await user.update({
			finished_quest_ids: {
				push: quest.id
			},
			QP: {
				increment: quest.qp
			}
		});

		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished ${bold(quest.name)}. You received ${quest.rewards}.`,
			undefined,
			data,
			null
		);
	}
};
