import { Client } from 'discord.js';

import { Tasks } from '../constants';
import { ActivityTaskOptions } from '../types/minions';
import { rand } from '../../util';

export default function addSubTaskToActivityTask(
	client: Client,
	taskName: Tasks,
	subTaskToAdd: ActivityTaskOptions
) {
	const task = client.schedule.tasks.find(_task => _task.taskName === taskName);

	if (!task) throw `Missing activity task: ${taskName}.`;

	const taskToAddWithDateAndID = {
		...subTaskToAdd,
		id: rand(1, 10_000_000),
		finishDate: Date.now() + subTaskToAdd.duration
	};

	return task.update({
		data: {
			...task.data,
			subTasks: [...task.data.subTasks, taskToAddWithDateAndID].sort(
				(a, b) => a.finishDate - b.finishDate
			)
		}
	});
}
