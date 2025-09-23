import { activity_type_enum } from '@prisma/client';
import { Monsters, resolveItems } from 'oldschooljs';

import { soteSkillRequirements } from '@/lib/skilling/functions/questRequirements.js';
import { courses } from '@/lib/skilling/skills/agility.js';
import butterflyNettingCreatures from '@/lib/skilling/skills/hunter/creatures/butterflyNetting.js';
import type {
	ActivityTaskData,
	AgilityActivityTaskOptions,
	HunterActivityTaskOptions,
	MonsterActivityTaskOptions,
	PickpocketActivityTaskOptions,
	WoodcuttingActivityTaskOptions
} from '@/lib/types/minions.js';

export enum WorldLocations {
	Priffdinas = 0,
	World = 1,
	Underwater = 2
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
						(activity as MonsterActivityTaskOptions).mi
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
					(activity as AgilityActivityTaskOptions).courseID ===
						courses.find(c => c.name === 'Prifddinas Rooftop Course')!.id
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
			if (
				activity.type === 'Hunter' &&
				(activity as HunterActivityTaskOptions).creatureID ===
					butterflyNettingCreatures.find(c => c.name === 'Crystal impling')!.id
			) {
				return true;
			}

			return false;
		}
	},
	{
		area: WorldLocations.Underwater,
		checker: (_user: MUser, activity: ActivityTaskData) => {
			const underWaterLocations: activity_type_enum[] = [
				activity_type_enum.DriftNet,
				activity_type_enum.UnderwaterAgilityThieving,
				activity_type_enum.DepthsOfAtlantis,
				activity_type_enum.FishingTrawler,
				activity_type_enum.AerialFishing,
				activity_type_enum.Fishing,
				activity_type_enum.CamdozaalFishing,
				activity_type_enum.FishingContest
			];
			return underWaterLocations.includes(activity.type);
		}
	}
];

export default function activityInArea(user: MUser, activity: ActivityTaskData) {
	for (const checkLocation of WorldLocationsChecker) {
		if (checkLocation.checker(user, activity)) return checkLocation.area;
	}
	return WorldLocations.World;
}
