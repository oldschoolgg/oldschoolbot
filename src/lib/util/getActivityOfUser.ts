import { Client } from 'discord.js';
import { KlasaUser } from 'klasa';

import { TickerTaskData } from '../types/minions';
import { activityTaskFilter } from '../util';

export default function getActivityOfUser(client: Client, user: KlasaUser) {
	for (const task of client.schedule.tasks.filter(activityTaskFilter)) {
		const taskData = task.data as TickerTaskData;
		for (const subTask of taskData.subTasks) {
			if (subTask.userID === user.id) return subTask;

			// @ts-expect-error
			if (subTask.users && subTask.users.includes(user.id)) {
				return subTask;
			}
		}
	}

	return null;
}
