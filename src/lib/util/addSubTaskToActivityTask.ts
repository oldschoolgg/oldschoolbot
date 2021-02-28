import { Client } from 'klasa';

import { ActivityTable } from '../typeorm/ActivityTable.entity';
import { ActivityTaskOptions } from '../types/minions';
import { isGroupActivity } from '../util';

export default async function addSubTaskToActivityTask<T extends ActivityTaskOptions>(
	client: Client,
	taskToAdd: Omit<T, 'finishDate' | 'id'>
) {
	const usersTask = client.getActivityOfUser(taskToAdd.userID);
	if (usersTask) {
		throw `That user is busy, so they can't do this minion activity.`;
	}

	const finishDate = Date.now() + taskToAdd.duration;

	let newData: Record<string, any> = { ...taskToAdd };
	delete newData.type;
	delete newData.userID;
	delete newData.id;
	delete newData.finishDate;
	delete newData.channelID;
	delete newData.duration;

	const result = await ActivityTable.insert({
		userID: taskToAdd.userID,
		startDate: new Date(),
		finishDate: new Date(finishDate),
		completed: false,
		type: taskToAdd.type,
		data: newData,
		groupActivity: isGroupActivity(taskToAdd),
		channelID: taskToAdd.channelID,
		duration: Math.floor(taskToAdd.duration)
	});

	const newTask: ActivityTaskOptions = {
		...taskToAdd,
		finishDate,
		id: result.identifiers[0].id
	};

	const users = isGroupActivity(newTask) ? newTask.users : [taskToAdd.userID];

	for (const user of users) {
		client.minionActivityCache.set(user, newTask);
	}
}
