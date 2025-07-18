import { questExtras } from '@/lib/minions/data/questExtras';
import { logError } from '@/lib/util/logError';
import deepMerge from 'deepmerge';
import { Quests } from 'oldschooljs';
import { SkillsEnum } from '../../lib/skilling/types';
import { UpdateBank } from '../../lib/structures/UpdateBank';
import type { SpecificQuestOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { getQuestRewardItemsBank } from '../../mahoji/lib/abstracted_commands/questCommand';

export const specificQuestTask: MinionTask = {
	type: 'SpecificQuest',
	async run(data: SpecificQuestOptions) {
		const { userID, channelID, questID } = data;
		const user = await mUserFetch(userID);
		let quest = Quests.find(quest => quest.id === questID)!;
		const extra = questExtras.find(q => q.id === quest.id);
		if (extra) {
			quest = deepMerge(quest, extra);
		}

		const updateBank = new UpdateBank();

		// Add item rewards
		const rewardBank = getQuestRewardItemsBank(quest).bank;
		if (rewardBank.length > 0) {
			updateBank.itemLootBank.add(rewardBank);
		}

		// Add XP rewards
		if (quest.skillsRewards && Object.keys(quest.skillsRewards).length > 0) {
			for (const [skillName, amount] of Object.entries(quest.skillsRewards)) {
				if (Object.values(SkillsEnum).includes(skillName as SkillsEnum)) {
					updateBank.xpBank.add(skillName as SkillsEnum, amount, { minimal: true });
				}
			}
		}

		// Add QP and finished quest
		const currentFinished = user.user.finished_quest_ids ?? [];
		if (!currentFinished.includes(quest.id)) {
			updateBank.userUpdates = {
				finished_quest_ids: { set: [...currentFinished, quest.id] }
			};
		}

		const resultOrError = await updateBank.transact(user);

		if (typeof resultOrError === 'string') {
			logError(new Error(`${user.logName} quest activity updateBank transact error: ${resultOrError}`), {
				user_id: user.id,
				iName: quest.name
			});
			return;
		}

		let completionMessage = `${user}, ${user.minionName} finished **${quest.name}**.`;
		if (rewardBank.length > 0) {
			completionMessage += ` You received ${rewardBank}.`;
		}
		if (quest.qp) {
			completionMessage += ` You gained ${quest.qp} Quest Point${quest.qp === 1 ? '' : 's'}, you now have ${user.QP} total.`;
		}
		if (quest.kudos) {
			completionMessage += ` You gained ${quest.kudos} Kudos, you now have ${user.kudos} total.`;
		}
		const messages = resultOrError?.rawResults ? resultOrError.rawResults : undefined;

		handleTripFinish(user, channelID, completionMessage, undefined, data, null, messages);
	}
};
