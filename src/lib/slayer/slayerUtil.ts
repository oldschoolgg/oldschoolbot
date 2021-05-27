import { randFloat } from 'e';
import { KlasaUser } from 'klasa';

import { UserSettings } from '../settings/types/UserSettings';
import { SkillsEnum } from '../skilling/types';
import { bossTasks } from './tasks/bossTasks';
import { AssignableSlayerTask, SlayerMaster } from './types';

export default function streakPoints(currentStreak: number, master: SlayerMaster) {
	const streaks = [1000, 250, 100, 50, 10];
	const multiplier = [50, 35, 25, 15, 5];
	if ((currentStreak <= 5 && master.masterId === 2) || currentStreak <= 4) {
		return 0;
	}
	for (let i = 0; i < streaks.length; i++) {
		if (currentStreak >= streaks[i] && currentStreak % streaks[i] === 0) {
			return master.basePoints * multiplier[i];
		}
	}
	return master.basePoints;
}

export default function taskPicker(user: KlasaUser, filteredTasks: AssignableSlayerTask[]) {
	let totalweight = 0;
	for (let i = 0; i < filteredTasks.length; i++) {
		totalweight += filteredTasks[i].weight;
	}
	const randomWeight = randFloat(1, totalweight);

	let result = 0;
	let weight = 0;

	for (let i = 0; i < filteredTasks.length; i++) {
		weight += filteredTasks[i].weight;
		if (randomWeight <= weight) {
			result = i;
			break;
		}
	}

	let task = filteredTasks[result];

	return task;
}

export default function filterTasks(user: KlasaUser, master: SlayerMaster) {}
