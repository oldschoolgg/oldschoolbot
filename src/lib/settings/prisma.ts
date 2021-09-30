import { Activity, ActivityEnum, Prisma, PrismaClient } from '@prisma/client';

import { client } from '../..';
import { ActivityTaskData } from '../types/minions';
import { isGroupActivity } from '../util';
import { taskNameFromType } from '../util/taskNameFromType';
import { minionActivityCache } from './settings';

export const prisma = new PrismaClient();

export function convertStoredActivityToFlatActivity(activity: Activity): ActivityTaskData {
	return {
		...(activity.data as Prisma.JsonObject),
		type: activity.type as ActivityEnum,
		userID: activity.user_id,
		channelID: activity.channel_id,
		duration: activity.duration,
		finishDate: activity.finish_date.getTime(),
		id: activity.id
	};
}

export function activitySync(activity: Activity) {
	const users: string[] = isGroupActivity(activity.data)
		? ((activity.data as Prisma.JsonObject).users! as string[])
		: [activity.user_id];
	for (const user of users) {
		minionActivityCache.set(user, convertStoredActivityToFlatActivity(activity));
	}
}

export async function completeActivity(_activity: Activity) {
	const activity = convertStoredActivityToFlatActivity(_activity);
	if (_activity.completed) {
		throw new Error('Tried to complete an already completed task.');
	}

	const taskName = taskNameFromType(activity.type);
	const task = client.tasks.get(taskName);

	if (!task) {
		throw new Error('Missing task');
	}

	client.oneCommandAtATimeCache.add(_activity.user_id);
	try {
		prisma.activity.update({
			where: {
				id: activity.id
			},
			data: {
				completed: true
			}
		});

		await task.run(activity);
	} catch (err) {
		console.error(err);
	} finally {
		client.oneCommandAtATimeCache.delete(activity.userID);
	}
}
