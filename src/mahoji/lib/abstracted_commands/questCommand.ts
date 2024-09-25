import { Time, sumArr } from 'e';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import { MAX_GLOBAL_QP, MAX_QP, quests } from '../../../lib/minions/data/quests';
import type { ActivityTaskOptionsWithNoChanges, SpecificQuestOptions } from '../../../lib/types/minions';
import { hasSkillReqs } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { minionIsBusy } from '../../../lib/util/minionIsBusy';
import { userHasGracefulEquipped } from '../../mahojiSettings';

export async function questCommand(user: MUser, channelID: string, name?: string) {
	if (!user.user.minion_hasBought) {
		return 'You need a minion to do a questing trip';
	}
	if (minionIsBusy(user.id)) {
		return 'Your minion must not be busy to do a questing trip';
	}

	if (name) {
		const quest = quests.find(q => q.name.toLowerCase() === name.toLowerCase());
		if (!quest) {
			return `That's not a valid quest, the quests you can do are: ${quests.map(q => q.name).join(', ')}.`;
		}

		if (user.user.finished_quest_ids.includes(quest.id)) {
			return `You've already completed ${quest.name}.`;
		}

		if (quest.qpReq) {
			if (user.QP < quest.qpReq) {
				return `You need ${quest.qpReq} QP to do ${quest.name}.`;
			}
		}

		// Check if the user has completed the required quests (if any)
		if (quest.prerequisitesQuests) {
			for (const prerequisite of quest.prerequisitesQuests) {
				if (!user.user.finished_quest_ids.includes(prerequisite)) {
					return `You need to complete "${quests.find(q => q.id === prerequisite)?.name}" before starting ${
						quest.name
					}.`;
				}
			}
		}

		if (quest.skillReqs) {
			const [hasReqs, reason] = hasSkillReqs(user, quest.skillReqs);
			if (!hasReqs) {
				return `To complete ${quest.name}, you need: ${reason}.`;
			}
		}
		if (user.isIronman && quest.ironmanSkillReqs) {
			const [hasIronReqs, ironReason] = hasSkillReqs(user, quest.ironmanSkillReqs);
			if (!hasIronReqs) {
				return `To complete ${quest.name} as an ironman, you need: ${ironReason}.`;
			}
		}

		const duration = quest.calcTime(user);

		await addSubTaskToActivityTask<SpecificQuestOptions>({
			type: 'SpecificQuest',
			duration,
			userID: user.id,
			channelID,
			questID: quest.id
		});

		return `${user.minionName} is now completing ${quest.name}, they'll finish in around ${formatDuration(
			duration
		)}.`;
	}

	const currentQP = user.QP;
	if (currentQP >= MAX_QP) {
		return 'You already have the maximum amount of Quest Points.';
	}

	const qpFromUnfinishedQuests = sumArr(
		quests.filter(i => !user.user.finished_quest_ids.includes(i.id)).map(i => i.qp)
	);

	if (qpFromUnfinishedQuests > 0 && currentQP >= MAX_GLOBAL_QP) {
		return `You already have the maximum amount of Quest Points from doing quests, you can get ${qpFromUnfinishedQuests} more from specific quests.`;
	}

	const boosts = [];

	let duration = Time.Minute * 30;

	if (userHasGracefulEquipped(user)) {
		duration *= 0.9;
		boosts.push('10% for Graceful');
	}

	await addSubTaskToActivityTask<ActivityTaskOptionsWithNoChanges>({
		type: 'Questing',
		duration,
		userID: user.id,
		channelID: channelID.toString()
	});
	let response = `${user.minionName} is now completing quests, they'll come back in around ${formatDuration(
		duration
	)}.`;

	if (boosts.length > 0) {
		response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return response;
}
