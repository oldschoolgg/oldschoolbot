import { Client } from 'discord.js';

import { Tasks, Activity } from '../constants';
import { ActivityTaskOptions } from '../types/minions';
import { GroupMonsterActivityTaskOptions } from '../minions/types';

export default function addSubTaskToActivityTask(
	client: Client,
	taskName: Tasks,
	subTaskToAdd: ActivityTaskOptions
) {
	const task = client.schedule.tasks.find(_task => _task.taskName === taskName);

	if (!task) throw `Missing activity task: ${taskName}.`;
	if (
		task.data.subTasks.some((task: ActivityTaskOptions) => {
			if (task.userID === subTaskToAdd.userID) return true;
			if (
				task.type === Activity.GroupMonsterKilling &&
				(task as GroupMonsterActivityTaskOptions).users.some(userID =>
					(subTaskToAdd as GroupMonsterActivityTaskOptions).users.includes(userID)
				)
			) {
				return true;
			}
		})
	) {
		throw `That user is busy, so they can't do this minion activity.`;
	}

	return task.update({
		data: {
			...task.data,
			subTasks: [...task.data.subTasks, subTaskToAdd].sort(
				(a, b) => a.finishDate - b.finishDate
			)
		}
	});
}
