import { Client } from 'discord.js';

import { Tasks } from '../constants';
import { ActivityTaskOptions } from '../types/minions';

export default function removeSubTasksFromActivityTask(
	client: Client,
	taskName: Tasks,
	subTasksToRemove: string[]
) {
	const task = client.schedule.tasks.find(_task => _task.taskName === taskName);

	if (!task) throw `Missing activity task: ${taskName}.`;

	return task.update({
		data: {
			...task.data,
			subTasks: (task.data.subTasks as ActivityTaskOptions[])
				.filter(task => !subTasksToRemove.includes(task.id))
				.sort((a, b) => a.finishDate - b.finishDate)
		}
	});
}
