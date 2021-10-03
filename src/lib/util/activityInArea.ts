import { Monsters } from 'oldschooljs';

import { Activity } from '../constants';
import {
	ActivityTaskOptions,
	AgilityActivityTaskOptions,
	MonsterActivityTaskOptions,
	PickpocketActivityTaskOptions
} from '../types/minions';

export const enum WorldLocations {
	Priffdinas,
	World
}

const WorldLocationsChecker = [
	{
		area: WorldLocations.Priffdinas,
		checker: (activity: ActivityTaskOptions) => {
			if ([Activity.Gauntlet, Activity.Zalcano].includes(activity.type)) return true;
			if (
				activity.type === Activity.MonsterKilling &&
				[Monsters.DarkBeast.id, Monsters.PrifddinasElf.id].includes(
					(activity as MonsterActivityTaskOptions).monsterID
				)
			) {
				return true;
			}
			if (
				activity.type === Activity.Pickpocket &&
				(activity as PickpocketActivityTaskOptions).monsterID === Monsters.PrifddinasElf.id
			) {
				return true;
			}
			if (
				activity.type === Activity.Agility &&
				(activity as AgilityActivityTaskOptions).courseID === 'Prifddinas Rooftop Course'
			) {
				return true;
			}

			return false;
		}
	}
];

export default function activityInArea(activity: ActivityTaskOptions) {
	for (const checkLocation of WorldLocationsChecker) {
		if (checkLocation.checker(activity)) return checkLocation.area;
	}
	return WorldLocations.World;
}
