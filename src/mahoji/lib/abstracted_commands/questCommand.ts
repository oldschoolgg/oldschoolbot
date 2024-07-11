import { sumArr, Time } from 'e';
import { Bank } from 'oldschooljs';

import { Skills } from '../../../lib/types';
import { ActivityTaskOptionsWithNoChanges, SpecificQuestOptions } from '../../../lib/types/minions';
import { formatDuration, hasSkillReqs } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { minionIsBusy } from '../../../lib/util/minionIsBusy';
import { userHasGracefulEquipped } from '../../mahojiSettings';

export const MAX_GLOBAL_QP = 293;

interface Quest {
	id: QuestID;
	qp: number;
	name: string;
	skillReqs?: Skills;
	ironmanSkillReqs?: Skills;
	qpReq?: number;
	rewards?: Bank;
	skillsRewards?: {
		[skill: string]: number;
	};
	combatLevelReq?: number;
	prerequisitesQuests?: QuestID[];
	calcTime: (user: MUser) => number;
}

export enum QuestID {
	DesertTreasureII = 1,
	ThePathOfGlouphrie = 2,
	ChildrenOfTheSun = 3,
	DefenderOfVarrock = 4,
	TheRibbitingTaleOfALillyPadLabourDispute = 5,
	PerilousMoons = 6,
	AtFirstLight = 7,
	TwilightsPromise = 8
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
	},
	{
		id: QuestID.ThePathOfGlouphrie,
		qp: 2,
		name: 'The Path of Glouphrie',
		skillReqs: {
			strength: 60,
			slayer: 56,
			thieving: 56,
			ranged: 47,
			agility: 45
		},
		ironmanSkillReqs: {
			fletching: 59,
			smithing: 59
		},
		combatLevelReq: 50,
		qpReq: 10,
		rewards: new Bank().add(28_587).add(28_588).add(28_589).add(28_590).freeze(),
		calcTime: (user: MUser) => {
			let duration = Time.Minute * 10;
			if (user.combatLevel < 90) {
				duration += Time.Minute * 5;
			}
			return duration;
		}
	},
	{
		id: QuestID.ChildrenOfTheSun,
		qp: 1,
		name: 'Children of the Sun',
		calcTime: () => {
			const duration = Time.Minute * 3;
			return duration;
		}
	},
	{
		id: QuestID.DefenderOfVarrock,
		qp: 2,
		name: 'Defender of Varrock',
		skillReqs: {
			smithing: 55,
			hunter: 52
		},
		combatLevelReq: 65,
		qpReq: 20,
		rewards: new Bank().add(28_820).freeze(),
		skillsRewards: {
			smithing: 15_000,
			hunter: 15_000
		},
		calcTime: (user: MUser) => {
			let duration = Time.Minute * 12;
			if (user.combatLevel < 100) {
				duration += Time.Minute * 8;
			}
			return duration;
		}
	},
	{
		id: QuestID.TheRibbitingTaleOfALillyPadLabourDispute,
		qp: 1,
		name: 'The Ribbiting Tale of a Lily Pad Labour Dispute',
		skillReqs: {
			woodcutting: 15
		},
		prerequisitesQuests: [QuestID.ChildrenOfTheSun],
		skillsRewards: {
			woodcutting: 2000
		},
		calcTime: () => {
			const duration = Time.Minute * 3;
			return duration;
		}
	},
	{
		id: QuestID.PerilousMoons,
		qp: 2,
		name: 'Perilous Moons',
		skillReqs: {
			slayer: 48,
			hunter: 20,
			fishing: 20,
			runecraft: 20,
			construction: 10
		},
		combatLevelReq: 75,
		prerequisitesQuests: [QuestID.ChildrenOfTheSun, QuestID.TwilightsPromise],
		skillsRewards: {
			slayer: 40_000,
			runecraft: 5000,
			hunter: 5000,
			fishing: 5000
		},
		calcTime: (user: MUser) => {
			let duration = Time.Minute * 20;
			if (user.combatLevel < 120) {
				duration += Time.Minute * 5;
			}
			if (user.combatLevel < 100) {
				duration += Time.Minute * 10;
			}
			return duration;
		}
	},
	{
		id: QuestID.AtFirstLight,
		qp: 1,
		name: 'At First Light',
		skillReqs: {
			hunter: 46,
			herblore: 30,
			construction: 27
		},
		combatLevelReq: 75,
		qpReq: 2,
		prerequisitesQuests: [QuestID.ChildrenOfTheSun],
		skillsRewards: {
			hunter: 4500,
			construction: 800,
			herblore: 500
		},
		calcTime: () => {
			let duration = Time.Minute * 6;
			return duration;
		}
	},
	{
		id: QuestID.TwilightsPromise,
		qp: 1,
		name: "Twilight's Promise",
		skillsRewards: {
			thieving: 3000
		},
		combatLevelReq: 40,
		prerequisitesQuests: [QuestID.ChildrenOfTheSun],
		calcTime: (user: MUser) => {
			let duration = Time.Minute * 9;
			if (user.combatLevel < 75) {
				duration += Time.Minute * 5;
			}
			return duration;
		}
	}
];

export const MAX_QP = MAX_GLOBAL_QP + sumArr(quests.map(i => i.qp));

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
