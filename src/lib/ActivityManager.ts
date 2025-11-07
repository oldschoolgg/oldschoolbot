import { cryptoRng } from '@oldschoolgg/rng';

import type { Activity, activity_type_enum } from '@/prisma/main.js';
import { globalConfig } from '@/lib/constants.js';
import { onMinionActivityFinish } from '@/lib/events.js';
import { allTasks } from '@/lib/Task.js';
import type { PrismaCompatibleJsonObject } from '@/lib/types/index.js';
import type { ActivityTaskData } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';

class SActivityManager {
	async cancelActivity(userID: string): Promise<void> {
		await prisma.activity.deleteMany({ where: { user_id: BigInt(userID), completed: false } });
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
			channelId: activity.channel_id.toString(),
			duration: activity.duration,
			finishDate: activity.finish_date.getTime(),
			id: activity.id
		} as ActivityTaskData;
	}

	async completeActivity(_activity: Activity): Promise<void> {
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
			await task.run(
				{ ...activity, channelId: activity.channelId },
				{
					user,
					handleTripFinish,
					rng: cryptoRng
				}
			);
		} catch (err) {
			Logging.logError(err as Error);
		} finally {
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

	async processPendingActivities(): Promise<void> {
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

	async minionIsBusy(userID: string | string): Promise<boolean> {
		const count = await prisma.activity.count({
			where: {
				user_id: BigInt(userID),
				completed: false
			}
		});
		return count > 0;
	}

	async anyMinionIsBusy(userIDs: (string | MUser)[]): Promise<boolean> {
		const count = await prisma.activity.count({
			where: {
				user_id: {
					in: userIDs.map(id => (typeof id === 'string' ? BigInt(id) : BigInt(id.id)))
				},
				completed: false
			}
		});
		return count > 0;
	}

	async getActivityOfUser(userID: string): Promise<ActivityTaskData | null> {
		const task = await prisma.activity.findFirst({
			where: {
				user_id: BigInt(userID),
				completed: false
			}
		});
		return task ? this.convertStoredActivityToFlatActivity(task) : null;
	}
}

const ActivityManagerSingleton = new SActivityManager();

declare global {
	var ActivityManager: typeof ActivityManagerSingleton;
}

global.ActivityManager = ActivityManagerSingleton;
