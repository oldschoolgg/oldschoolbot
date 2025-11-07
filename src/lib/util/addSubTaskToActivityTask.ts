import { UserError } from '@oldschoolgg/toolkit';

import type { ActivityTaskData, ActivityTaskOptions } from '@/lib/types/minions.js';
import { isGroupActivity } from '@/lib/util/activityTypeCheck.js';

export type DatabaseStoredActivityData = Omit<
	ActivityTaskOptions,
	'finishDate' | 'id' | 'type' | 'channelId' | 'userID' | 'duration'
>;

export default async function addSubTaskToActivityTask<T extends ActivityTaskData>(
	taskToAdd: Omit<T, 'finishDate' | 'id'>
) {
	const existingActivities = await prisma.activity.count({
		where: {
			user_id: BigInt(taskToAdd.userID),
			completed: false
		}
	});
	if (existingActivities > 0) {
		throw new UserError(
			`That user is busy, so they can't do this minion activity. They have an activity still ongoing`
		);
	}

	const duration = Math.floor(taskToAdd.duration);
	if (duration < 0) {
		const error = new Error('Task has a negative duration');
		Logging.logError(error, {
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
	__newData.channelId = undefined;
	__newData.duration = undefined;

	const newData: DatabaseStoredActivityData = {
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
		channel_id: BigInt(taskToAdd.channelId),
		duration
	} as const;
	try {
		const createdActivity = await prisma.activity.create({
			data
		});
		return createdActivity;
	} catch (err: unknown) {
		Logging.logError(err as Error, {
			user_id: taskToAdd.userID,
			data: JSON.stringify(data)
		});
		throw new UserError('There was an error starting your activity.');
	}
}
