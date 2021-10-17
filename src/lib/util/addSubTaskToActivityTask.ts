import { prisma } from '../settings/prisma';
import { getActivityOfUser } from '../settings/settings';
import { ActivityTaskOptions } from '../types/minions';
import { isGroupActivity } from '../util';

export default async function addSubTaskToActivityTask<T extends ActivityTaskOptions>(
	taskToAdd: Omit<T, 'finishDate' | 'id'>
) {
	const usersTask = getActivityOfUser(taskToAdd.userID);
	if (usersTask) {
		throw `That user is busy, so they can't do this minion activity. They have a ${usersTask.type} activity still ongoing`;
	}
	console.log(
		`${new Date().toLocaleString()} ${taskToAdd.userID} starting ${taskToAdd.type} trip in ${taskToAdd.channelID}`
	);
	let duration = Math.floor(taskToAdd.duration);

	const finishDate = new Date(Date.now() + duration);

	let __newData: Partial<ActivityTaskOptions> = { ...taskToAdd };
	delete __newData.type;
	delete __newData.userID;
	delete __newData.id;
	delete __newData.channelID;
	delete __newData.duration;

	let newData: Omit<ActivityTaskOptions, 'finishDate' | 'id' | 'type' | 'channelID' | 'userID' | 'duration'> = {
		...__newData
	};

	prisma.activity.create({
		data: {
			user_id: taskToAdd.userID,
			start_date: new Date(),
			finish_date: finishDate,
			completed: false,
			type: taskToAdd.type,
			data: newData,
			group_activity: isGroupActivity(taskToAdd),
			channel_id: taskToAdd.channelID,
			duration
		}
	});
}
