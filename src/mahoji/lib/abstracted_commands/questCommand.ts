import { sumArr, Time } from 'e';
import { Bank } from 'oldschooljs';

import { Skills } from '../../../lib/types';
import { ActivityTaskOptionsWithNoChanges, SpecificQuestOptions } from '../../../lib/types/minions';
import { formatDuration } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { minionIsBusy } from '../../../lib/util/minionIsBusy';
import { userHasGracefulEquipped } from '../../mahojiSettings';

export const MAX_GLOBAL_QP = 293;

interface Quest {
	id: QuestID;
	qp: number;
	name: string;
	skillReqs: Skills;
	qpReq: number;
	rewards: Bank;
	combatLevelReq: number;
	calcTime: (user: MUser) => number;
}

export enum QuestID {
	DesertTreasureII = 1
}

export const quests: Quest[] = [
	{
		id: QuestID.DesertTreasureII,
		qp: 5,
		name: 'Desert Treasure II - The Fallen Empire',
		skillReqs: {
			firemaking: 75,
			magic: 75,
			thieving: 70,
			herblore: 62,
			runecraft: 60,
			construction: 60
		},
		combatLevelReq: 110,
		qpReq: 150,
		rewards: new Bank().add(28_409, 3).add('Ring of shadows').freeze(),
		calcTime: (user: MUser) => {
			let duration = Time.Hour * 3;
			if (user.combatLevel < 100) {
				duration += Time.Minute * 30;
			}
			if (user.combatLevel < 90) {
				duration += Time.Minute * 40;
			}
			const percentOfBossCL = user.percentOfBossCLFinished();
			if (percentOfBossCL < 10) {
				duration += Time.Minute * 20;
			} else if (percentOfBossCL < 30) {
				duration += Time.Minute * 10;
			} else if (percentOfBossCL > 80) {
				duration -= Time.Minute * 60;
			} else if (percentOfBossCL > 50) {
				duration -= Time.Minute * 30;
			}
			return duration;
		}
	}
];

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

		if (user.QP < quest.qpReq) {
			return `You need ${quest.qpReq} QP to do ${quest.name}.`;
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
	if (currentQP >= MAX_GLOBAL_QP) {
		return 'You already have the maximum amount of Quest Points.';
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

export const MAX_QP = MAX_GLOBAL_QP + sumArr(quests.map(i => i.qp));
