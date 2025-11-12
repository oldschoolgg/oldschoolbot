import { UserError } from '@oldschoolgg/toolkit';

import type { Prisma } from '@/prisma/main.js';
import type { ActivityTaskData, ActivityTaskOptions } from '@/lib/types/minions.js';
import { isGroupActivity } from '@/lib/util.js';

export default async function addSubTaskToActivityTask<T extends ActivityTaskData>(
	taskToAdd: Omit<T, 'finishDate' | 'id'>
) {
	const usersTask = await ActivityManager.getActivityOfUser(taskToAdd.userID);
	if (usersTask) {
		throw new UserError(
			`That user is busy, so they can't do this minion activity. They have a ${usersTask.type} activity still ongoing`
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

	const allUserIDs = new Set<string>([taskToAdd.userID]);
	if (isGroupActivity(taskToAdd)) {
		for (const id of taskToAdd.users) {
			allUserIDs.add(id);
		}
	}

	const __newData: Partial<ActivityTaskData> = { ...taskToAdd } as Partial<ActivityTaskData>;
	__newData.type = undefined;
	__newData.userID = undefined;
	__newData.id = undefined;
	__newData.channelID = undefined;
	__newData.duration = undefined;
	(__newData as Prisma.JsonObject).all_user_ids = [...allUserIDs];

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
		return await prisma.activity.create({
			data
		});
	} catch (err: any) {
		Logging.logError(err, {
			user_id: taskToAdd.userID,
			data: JSON.stringify(data)
		});
		throw new UserError('There was an error starting your activity.');
	}
}
