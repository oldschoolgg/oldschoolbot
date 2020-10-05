import { Client } from 'discord.js';
import { KlasaUser } from 'klasa';

import { GroupMonsterActivityTaskOptions } from '../minions/types';
import { TickerTaskData } from '../types/minions';
import { activityTaskFilter } from '../util';

export default function getActivityOfUser(client: Client, user: KlasaUser) {
	for (const task of client.schedule.tasks.filter(activityTaskFilter)) {
		const taskData = task.data as TickerTaskData;
		for (const subTask of taskData.subTasks) {
			if (subTask.userID === user.id) return subTask;

			if (
				(subTask as GroupMonsterActivityTaskOptions).users &&
				(subTask as GroupMonsterActivityTaskOptions).users.includes(user.id)
			) {
				return subTask;
			}
		}
	}

	return null;
}
