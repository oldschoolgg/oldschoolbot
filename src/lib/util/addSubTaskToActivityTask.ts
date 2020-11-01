import { Client } from 'discord.js';

import { Tasks } from '../constants';
import { ActivityTaskOptions } from '../types/minions';
import { uuid } from '../util';
import getActivityOfUser from './getActivityOfUser';

export default function addSubTaskToActivityTask<T extends ActivityTaskOptions>(
	client: Client,
	taskName: Tasks,
	subTaskToAdd: Omit<T, 'finishDate' | 'id'>
) {
	const task = client.schedule.tasks.find(_task => _task.taskName === taskName);

	if (!task) throw `Missing activity task: ${taskName}.`;
	const usersTask = getActivityOfUser(client, subTaskToAdd.userID);
	if (usersTask) {
		throw `That user is busy, so they can't do this minion activity.`;
	}

	const newSubtask: ActivityTaskOptions = {
		...subTaskToAdd,
		finishDate: Date.now() + 1,
		id: uuid()
	};

	return task.update({
		data: {
			...task.data,
			subTasks: [...task.data.subTasks, newSubtask].sort(
				(a, b) => a.finishDate - b.finishDate
			)
		}
	});
}
