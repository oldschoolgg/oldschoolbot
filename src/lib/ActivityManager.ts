import type { Activity, Prisma, activity_type_enum } from '@prisma/client';

import { allTasks } from './Task.js';
import { modifyBusyCounter } from './busyCounterCache.js';
import { globalConfig } from './constants.js';
import { onMinionActivityFinish } from './events.js';
import { sql } from './postgres.js';
import type { ActivityTaskData } from './types/minions.js';
import { isGroupActivity } from './util.js';
import { handleTripFinish } from './util/handleTripFinish.js';
import { logError } from './util/logError.js';

class SActivityManager {
	private minionActivityCache: Map<string, ActivityTaskData> = new Map();

	async cancelActivity(userID: string) {
		await prisma.activity.deleteMany({ where: { user_id: BigInt(userID), completed: false } });
		this.minionActivityCacheDelete(userID);
	}

	convertStoredActivityToFlatActivity(activity: Activity): ActivityTaskData {
		if (!activity.channel_id) {
			throw new Error(`Activity ${activity.id} has no channel_id`);
		}
		return {
			...(activity.data as Prisma.JsonObject),
			type: activity.type as activity_type_enum,
			userID: activity.user_id.toString(),
			channelID: activity.channel_id.toString(),
			duration: activity.duration,
			finishDate: activity.finish_date.getTime(),
			id: activity.id
		} as ActivityTaskData;
	}

	syncActivityCache = async () => {
		const tasks = await prisma.activity.findMany({ where: { completed: false } });
		this.minionActivityCache.clear();
		for (const task of tasks) {
			this.activitySync(task);
		}
	};

	activitySync(activity: Activity) {
		const users: bigint[] | string[] = isGroupActivity(activity.data)
			? ((activity.data as Prisma.JsonObject).users! as string[])
			: [activity.user_id];
		const convertedActivity = this.convertStoredActivityToFlatActivity(activity);
		for (const user of users) {
			this.minionActivityCache.set(user.toString(), convertedActivity);
		}
	}

	async completeActivity(_activity: Activity) {
		const activity = this.convertStoredActivityToFlatActivity(_activity);

		if (_activity.completed) {
			logError(new Error('Tried to complete an already completed task.'));
			return;
		}

		const task = allTasks.find(i => i.type === activity.type)!;
		if (!task) {
			logError(new Error('Missing task'));
			return;
		}

		modifyBusyCounter(activity.userID, 1);
		try {
			if ('isNew' in task) {
				await task.run(activity, { user: await mUserFetch(activity.userID), handleTripFinish });
			} else {
				await task.run(activity);
			}
		} catch (err) {
			logError(err);
		} finally {
			modifyBusyCounter(activity.userID, -1);
			this.minionActivityCacheDelete(activity.userID);
			await onMinionActivityFinish(activity);
		}
	}

	async processPendingActivities() {
		const activities: Activity[] = globalConfig.isProduction
			? await sql`SELECT * FROM activity WHERE completed = false AND finish_date < NOW() LIMIT 5;`
			: await sql`SELECT * FROM activity WHERE completed = false;`;

		if (activities.length > 0) {
			await prisma.activity.updateMany({
				where: {
					id: {
						in: activities.map(i => i.id)
					}
				},
				data: {
					completed: true
				}
			});
			await Promise.all(activities.map(_act => this.completeActivity(_act)));
		}
	}

	minionActivityCacheDelete(userID: string) {
		const entry = this.minionActivityCache.get(userID);
		if (!entry) return;

		const users: string[] = isGroupActivity(entry) ? entry.users : [entry.userID];
		for (const u of users) {
			this.minionActivityCache.delete(u);
		}
	}

	minionIsBusy(userID: string | string): boolean {
		const usersTask = this.getActivityOfUser(userID.toString());
		return Boolean(usersTask);
	}

	getActivityOfUser(userID: string) {
		const task = this.minionActivityCache.get(userID);
		return task ?? null;
	}
}

const ActivityManagerSingleton = new SActivityManager();

declare global {
	var ActivityManager: typeof ActivityManagerSingleton;
}

global.ActivityManager = ActivityManagerSingleton;
