import { sumArr, Time } from 'e';
import { Bank } from 'oldschooljs';

import { Skills } from '../../types';

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
		rewards: new Bank().add(28_587).add(28_587).add(28_588).add(28_589).add(28_590).freeze(),
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
		// Awaiting item update for the lamp to be added
		// rewards: new Bank().add(28_820).freeze(),
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

export const MAX_GLOBAL_QP = 293;
export const MAX_QP = MAX_GLOBAL_QP + sumArr(quests.map(i => i.qp));
