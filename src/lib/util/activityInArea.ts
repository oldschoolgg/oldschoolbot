import { Monsters } from 'oldschooljs';

import { soteSkillRequirements } from '../skilling/functions/questRequirements';
import {
	ActivityTaskData,
	AgilityActivityTaskOptions,
	MonsterActivityTaskOptions,
	PickpocketActivityTaskOptions,
	WoodcuttingActivityTaskOptions
} from '../types/minions';
import resolveItems from './resolveItems';

export const enum WorldLocations {
	Priffdinas,
	World
}

const WorldLocationsChecker = [
	{
		area: WorldLocations.Priffdinas,
		checker: (user: MUser, activity: ActivityTaskData) => {
			if (user.hasSkillReqs(soteSkillRequirements) && user.QP >= 150) {
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
				if (
					activity.type === 'Woodcutting' &&
					resolveItems(['Teak logs', 'Mahogany logs']).includes(
						(activity as WoodcuttingActivityTaskOptions).logID
					) &&
					(activity as WoodcuttingActivityTaskOptions).forestry === true
				) {
					return true;
				}
			}

			return false;
		}
	}
];

export default function activityInArea(user: MUser, activity: ActivityTaskData) {
	for (const checkLocation of WorldLocationsChecker) {
		if (checkLocation.checker(user, activity)) return checkLocation.area;
	}
	return WorldLocations.World;
}
