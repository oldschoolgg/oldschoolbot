import { prisma } from '../settings/prisma';
import { activitySync, getActivityOfUser } from '../settings/settings';
import { ActivityTaskOptions } from '../types/minions';
import { isGroupActivity } from '../util';
import { createActivityData } from './activityDataHandling';
import { logError } from './logError';

export default async function addSubTaskToActivityTask<T extends ActivityTaskOptions>(
	taskToAdd: Omit<T, 'finishDate' | 'id'>
) {
	const usersTask = getActivityOfUser(taskToAdd.userID);
	if (usersTask) {
		throw `That user is busy, so they can't do this minion activity. They have a ${usersTask.type} activity still ongoing`;
	}

	let duration = Math.floor(taskToAdd.duration);
	if (duration < 0) {
		const error = new Error('Task has a negative duration');
		logError(error, {
			user_id: taskToAdd.userID,
			task: taskToAdd.type
		});
		throw error;
	}

	const finishDate = new Date(Date.now() + duration);

	const newData = createActivityData(taskToAdd);

	try {
		const createdActivity = await prisma.activity.create({
			data: {
				user_id: BigInt(taskToAdd.userID),
				start_date: new Date(),
				finish_date: finishDate,
				completed: false,
				type: taskToAdd.type,
				data: newData ?? undefined,
				group_activity: isGroupActivity(taskToAdd),
				channel_id: BigInt(taskToAdd.channelID),
				duration
			}
		});
		activitySync(createdActivity);
		return createdActivity;
	} catch (err: any) {
		logError(err);
		throw 'There was an error starting your activity.';
	}
}
