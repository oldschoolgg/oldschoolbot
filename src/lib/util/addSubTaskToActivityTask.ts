import { Client } from 'discord.js';

import { Tasks, Activity } from '../constants';
import { ActivityTaskOptions, RaidsActivityTaskOptions } from '../types/minions';
import { GroupMonsterActivityTaskOptions } from '../minions/types';
import { uuid } from '../util';

export default function addSubTaskToActivityTask<T extends ActivityTaskOptions>(
	client: Client,
	taskName: Tasks,
	subTaskToAdd: Omit<T, 'finishDate' | 'id'>
) {
	const task = client.schedule.tasks.find(_task => _task.taskName === taskName);

	if (!task) throw `Missing activity task: ${taskName}.`;
	if (
		task.data.subTasks.some((subTask: ActivityTaskOptions) => {
			if (subTask.userID === subTaskToAdd.userID) return true;
			if (
				subTask.type === Activity.GroupMonsterKilling &&
				(subTask as GroupMonsterActivityTaskOptions).users.includes(subTaskToAdd.userID)
			) {
				return true;
			}
			if (
				subTask.type === Activity.Raids &&
				(subTask as RaidsActivityTaskOptions).users.includes(subTaskToAdd.userID)
			) {
				return true;
			}
		})
	) {
		throw `That user is busy, so they can't do this minion activity.`;
	}

	const newSubtask: ActivityTaskOptions = {
		...subTaskToAdd,
		finishDate: Date.now() + subTaskToAdd.duration,
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
