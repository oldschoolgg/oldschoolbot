import { UserError } from '@oldschoolgg/toolkit/structures';
import { activitySync } from '../settings/settings';
import type { ActivityTaskData, ActivityTaskOptions } from '../types/minions';
import { isGroupActivity } from '../util';
import { logError } from './logError';
import { getActivityOfUser } from './minionIsBusy';

export default async function addSubTaskToActivityTask<T extends ActivityTaskData>(
	taskToAdd: Omit<T, 'finishDate' | 'id'>
) {
	const usersTask = getActivityOfUser(taskToAdd.userID);
	if (usersTask) {
		throw new UserError(
			`That user is busy, so they can't do this minion activity. They have a ${usersTask.type} activity still ongoing`
		);
	}

	const duration = Math.floor(taskToAdd.duration);
	if (duration < 0) {
		const error = new Error('Task has a negative duration');
		logError(error, {
			user_id: taskToAdd.userID,
			task: taskToAdd.type
		});
		throw error;
	}

	const finishDate = new Date(Date.now() + duration);

	const __newData: Partial<ActivityTaskData> = { ...taskToAdd } as Partial<ActivityTaskData>;
	__newData.type = undefined;
	__newData.userID = undefined;
	__newData.id = undefined;
	__newData.channelID = undefined;
	__newData.duration = undefined;

	const newData: Omit<ActivityTaskOptions, 'finishDate' | 'id' | 'type' | 'channelID' | 'userID' | 'duration'> = {
		...__newData
	};

	const data = {
		user_id: BigInt(taskToAdd.userID),
		start_date: new Date(),
		finish_date: finishDate,
		completed: false,
		type: taskToAdd.type,
		data: newData,
		group_activity: isGroupActivity(taskToAdd),
		channel_id: BigInt(taskToAdd.channelID),
		duration
	} as const;
	try {
		const createdActivity = await prisma.activity.create({
			data
		});
		activitySync(createdActivity);
		return createdActivity;
	} catch (err: any) {
		logError(err, {
			user_id: taskToAdd.userID,
			data: JSON.stringify(data)
		});
		throw new UserError('There was an error starting your activity.');
	}
}
