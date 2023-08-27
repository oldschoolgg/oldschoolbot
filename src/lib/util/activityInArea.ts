import { Monsters } from 'oldschooljs';

import {
	ActivityTaskData,
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
		checker: (activity: ActivityTaskData) => {
			if (['Gauntlet', 'Zalcano'].includes(activity.type)) return true;
			if (
				activity.type === 'MonsterKilling' &&
				[Monsters.DarkBeast.id, Monsters.PrifddinasElf.id].includes(
					(activity as MonsterActivityTaskOptions).monsterID
				)
			) {
				return true;
			}
			if (
				activity.type === 'Pickpocket' &&
				(activity as PickpocketActivityTaskOptions).monsterID === Monsters.PrifddinasElf.id
			) {
				return true;
			}
			if (
				activity.type === 'Agility' &&
				(activity as AgilityActivityTaskOptions).courseID === 'Prifddinas Rooftop Course'
			) {
				return true;
			}

			return false;
		}
	}
];

export default function activityInArea(activity: ActivityTaskData) {
	for (const checkLocation of WorldLocationsChecker) {
		if (checkLocation.checker(activity)) return checkLocation.area;
	}
	return WorldLocations.World;
}
