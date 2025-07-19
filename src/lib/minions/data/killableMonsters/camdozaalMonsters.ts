import { Time } from 'e';
import { EQuest, Monsters } from 'oldschooljs';

import type { KillableMonster } from '../../types';

export const camdozaalMonsters: KillableMonster[] = [
	{
		id: Monsters.FlawedGolem.id,
		name: Monsters.FlawedGolem.name,
		aliases: Monsters.FlawedGolem.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.FlawedGolem,
		wildy: false,
		difficultyRating: 0,
		requiredQuests: [EQuest.BELOW_ICE_MOUNTAIN]
	},
	{
		id: Monsters.MindGolem.id,
		name: Monsters.MindGolem.name,
		aliases: Monsters.MindGolem.aliases,
		timeToFinish: Time.Second * 18,
		table: Monsters.MindGolem,
		wildy: false,
		difficultyRating: 1,
		requiredQuests: [EQuest.BELOW_ICE_MOUNTAIN]
	},
	{
		id: Monsters.BodyGolem.id,
		name: Monsters.BodyGolem.name,
		aliases: Monsters.BodyGolem.aliases,
		timeToFinish: Time.Second * 22,
		table: Monsters.BodyGolem,
		wildy: false,
		difficultyRating: 1,
		requiredQuests: [EQuest.BELOW_ICE_MOUNTAIN]
	},
	{
		id: Monsters.ChaosGolem.id,
		name: Monsters.ChaosGolem.name,
		aliases: Monsters.ChaosGolem.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.ChaosGolem,
		wildy: false,
		difficultyRating: 2,
		requiredQuests: [EQuest.BELOW_ICE_MOUNTAIN]
	}
];
