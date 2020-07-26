import { /* SkillsEnum,*/ SlayerTask } from '../../../../skilling/types';
import { KlasaMessage } from 'klasa';
// import bossTasks from '../tasks/bossTasks'
import { rand } from '../../../../util';

// Filters out the tasks the user can be assigned from a certain slayermaster.
export default function taskPicker(msg: KlasaMessage, filteredTasks: SlayerTask[]) {
	const { settings /* ,skillLevel*/ } = msg.author;
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

	const task = filteredTasks[result];
	/* Temp disabled, need to look over how the filter with "!" works.
    if (task.name === 'Boss') {
        const filteredBossTasks = bossTasks.filter(task => task.slayerLvl! <= skillLevel(SkillsEnum.Slayer));
        task = filteredBossTasks[rand(0, filteredBossTasks.length)];
    }
    */

	return task;
}
