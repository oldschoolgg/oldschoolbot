import { SkillsEnum, SlayerTask } from '../../../../skilling/types';
import { KlasaMessage } from 'klasa';
import bossTasks from '../tasks/bossTasks';
import { rand } from '../../../../util';

// Filters out the tasks the user can be assigned from a certain slayermaster.
export default function taskPicker(msg: KlasaMessage, filteredTasks: SlayerTask[]) {
	const { settings } = msg.author;
	settings.sync(true);

	if (filteredTasks.length === 0) {
		throw `WTF!`;
	}

	// Calculates totalweightning
	let totalweight = 0;
	for (let i = 0; i < filteredTasks.length; i++) {
		totalweight += filteredTasks[i].weight;
	}
	// Random number between 1 and the total weighting
	const randomWeight = rand(1, totalweight);

	// The index of the task that will be used.
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
	// If boss task, loop again
	if (task.name === 'Boss') {
		// Filter boss tasks by slayer level
		for (let i = 0; i < bossTasks.length; i++) {
			if (bossTasks[i].slayerLvl! > msg.author.skillLevel(SkillsEnum.Slayer)) {
				delete bossTasks[i];
			}
		}
		const filteredBossTasks = bossTasks.filter(task => task !== undefined);
		/*
		filteredTaskList = filteredTaskList.filter(
			task => task.slayerLvl! <= msg.author.skillLevel(SkillsEnum.Slayer)
		);
		*/
		task = filteredBossTasks[rand(0, filteredBossTasks.length)];
	}

	return task;
}
