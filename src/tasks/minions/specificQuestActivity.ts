import { bold } from 'discord.js';

import type { SpecificQuestOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { quests } from '../../mahoji/lib/abstracted_commands/questCommand';

export const specificQuestTask: MinionTask = {
	type: 'SpecificQuest',
	async run(data: SpecificQuestOptions) {
		const { userID, channelID, questID } = data;
		const user = await mUserFetch(userID);
		const quest = quests.find(quest => quest.id === questID)!;

		await user.addItemsToBank({ items: quest.rewards, collectionLog: true });
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
