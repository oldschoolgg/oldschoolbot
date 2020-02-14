import { KlasaUser } from 'klasa';
import { Client } from 'discord.js';

import { activityTaskFilter } from '../util';
import { TickerTaskData } from '../types/minions';

export default function getActivityOfUser(client: Client, user: KlasaUser) {
	for (const task of client.schedule.tasks.filter(activityTaskFilter)) {
		const taskData = task.data as TickerTaskData;
		for (const subTask of taskData.subTasks) {
			if (subTask.userID === user.id) return subTask;
		}
	}

	return null;
}
