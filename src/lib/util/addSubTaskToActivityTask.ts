import { UserError } from '@oldschoolgg/toolkit';
import { omit } from 'remeda';

import type { Prisma } from '@/prisma/main.js';
import type { ActivityTaskData, ActivityTaskOptions } from '@/lib/types/minions.js';
import { isGroupActivity } from '@/lib/util/activityTypeCheck.js';

export type DatabaseStoredActivityData = Omit<
	ActivityTaskOptions,
	'finishDate' | 'id' | 'type' | 'channelId' | 'userID' | 'duration'
>;

export default async function addSubTaskToActivityTask(taskToAdd: Omit<ActivityTaskData, 'finishDate' | 'id'>) {
	const userIds: string[] =
		'users' in taskToAdd && taskToAdd.users ? (taskToAdd.users as string[]) : [taskToAdd.userID];
	const existingActivities = await prisma.activity.count({
		where: {
			all_user_ids: {
				hasSome: userIds.map(i => BigInt(i))
			},
			completed: false
		}
	});
	if (existingActivities > 0) {
		throw new UserError(
			userIds.length > 1
				? 'One or more users have an existing activity already in progress.'
				: 'You have an existing activity already in progress.'
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

	const newData: DatabaseStoredActivityData = omit(taskToAdd, ['type', 'userID', 'channelId', 'duration']);

	const data: Prisma.ActivityCreateInput = {
		user_id: BigInt(taskToAdd.userID),
		start_date: new Date(),
		finish_date: finishDate,
		completed: false,
		type: taskToAdd.type,
		data: newData,
		group_activity: isGroupActivity(taskToAdd),
		channel_id: BigInt(taskToAdd.channelId),
		duration,
		all_user_ids: userIds.map(i => BigInt(i))
	};
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
