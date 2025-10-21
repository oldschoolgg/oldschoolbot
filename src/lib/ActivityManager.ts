import { cryptoRng } from '@oldschoolgg/rng';

import type { Activity, activity_type_enum, Prisma } from '@/prisma/main.js';
import { globalConfig } from '@/lib/constants.js';
import { onMinionActivityFinish } from '@/lib/events.js';
import { allTasks } from '@/lib/Task.js';
import type { PrismaCompatibleJsonObject } from '@/lib/types/index.js';
import type { ActivityTaskData } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { isGroupActivity } from '@/lib/util.js';

class SActivityManager {
	private minionActivityCache: Map<string, ActivityTaskData> = new Map();

	async cancelActivity(userID: string) {
		await prisma.activity.deleteMany({ where: { user_id: BigInt(userID), completed: false } });
		this.minionActivityCacheDelete(userID);
	}

	async startTrip<T extends ActivityTaskData>(tripData: Omit<T, 'finishDate' | 'id'>) {
		return addSubTaskToActivityTask(tripData);
	}

	convertStoredActivityToFlatActivity(activity: Activity): ActivityTaskData {
		if (!activity.channel_id) {
			throw new Error(`Activity ${activity.id} has no channel_id`);
		}
		return {
			...(activity.data as PrismaCompatibleJsonObject),
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
		Logging.logDebug(`Completing activity ${_activity.id} of type ${_activity.type}`, {
			type: 'ACTIVITY',
			activity_type: _activity.type,
			data: _activity.data,
			user_id: _activity.user_id
		});
		const start = performance.now();
		const activity = this.convertStoredActivityToFlatActivity(_activity);

		if (_activity.completed) {
			Logging.logError(new Error('Tried to complete an already completed task.'));
			return;
		}

		const task = allTasks.find(i => i.type === activity.type)!;
		if (!task) {
			Logging.logError(new Error('Missing task'));
			return;
		}

		const user = await mUserFetch(activity.userID);

		try {
			await task.run(activity, { user, handleTripFinish, rng: cryptoRng });
		} catch (err) {
			Logging.logError(err as Error);
		} finally {
			this.minionActivityCacheDelete(activity.userID);
			await onMinionActivityFinish(activity);
		}
		const end = performance.now();
		Logging.logDebug(`Completed activity ${_activity.id} of type ${_activity.type} in ${end - start}ms`, {
			type: 'ACTIVITY',
			activity_type: _activity.type,
			data: _activity.data,
			user_id: _activity.user_id,
			duration: end - start
		});
	}

	async processPendingActivities() {
		const activities: Activity[] = globalConfig.isProduction
			? await prisma.$queryRaw`SELECT * FROM activity WHERE completed = false AND finish_date < NOW() LIMIT 5;`
			: await prisma.$queryRaw`SELECT * FROM activity WHERE completed = false;`;

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
