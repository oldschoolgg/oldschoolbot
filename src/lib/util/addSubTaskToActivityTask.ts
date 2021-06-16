import { Time } from 'e';

import { production } from '../../config';
import { getActivityOfUser, minionActivityCache } from '../settings/settings';
import { ActivityTable } from '../typeorm/ActivityTable.entity';
import { ActivityTaskOptions } from '../types/minions';
import { isGroupActivity } from '../util';

export default async function addSubTaskToActivityTask<T extends ActivityTaskOptions>(
	taskToAdd: Omit<T, 'finishDate' | 'id'>
) {
	const usersTask = getActivityOfUser(taskToAdd.userID);
	if (usersTask) {
			`That user is busy, so they can't do this minion activity. They have a ${usersTask.type} activity still ongoing`
		);
	}

	const finishDate = new Date(Date.now() + (production ? taskToAdd.duration : Time.Second * 5));

	let __newData: Partial<ActivityTaskOptions> = { ...taskToAdd };
	delete __newData.type;
	delete __newData.userID;
	delete __newData.id;
	delete __newData.channelID;
	delete __newData.duration;

	let newData: Omit<ActivityTaskOptions, 'finishDate' | 'id' | 'type' | 'channelID' | 'userID' | 'duration'> = {
		...__newData
	};

	const activity = new ActivityTable();
	activity.userID = taskToAdd.userID;
	activity.startDate = new Date();
	activity.finishDate = finishDate;
	activity.completed = false;
	activity.type = taskToAdd.type;
	activity.data = newData;
	activity.groupActivity = isGroupActivity(taskToAdd);
	activity.channelID = taskToAdd.channelID;
	activity.duration = Math.floor(taskToAdd.duration);
	await activity.save();

	const users = isGroupActivity(newData) ? newData.users : [taskToAdd.userID];

	for (const user of users) {
		minionActivityCache.set(user, activity.taskData);
	}
}
