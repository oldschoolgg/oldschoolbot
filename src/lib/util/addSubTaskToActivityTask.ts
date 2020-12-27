import { Client } from 'klasa';

import { Tasks } from '../constants';
import { OldSchoolBotClient } from '../structures/OldSchoolBotClient';
import { ActivityTaskOptions } from '../types/minions';
import { uuid } from '../util';
import getActivityOfUser from './getActivityOfUser';

export default function addSubTaskToActivityTask<T extends ActivityTaskOptions>(
	client: Client,
	taskName: Tasks,
	subTaskToAdd: Omit<T, 'finishDate' | 'id'>
) {
	const task = client.schedule.tasks.find(_task => _task.taskName === taskName);

	if (!task) throw `Missing activity task: ${taskName}.`;
	const usersTask = getActivityOfUser(client, subTaskToAdd.userID);
	if (usersTask) {
		throw `That user is busy, so they can't do this minion activity.`;
	}

	const finishDate = Date.now() + subTaskToAdd.duration;
	const newSubtask: ActivityTaskOptions = {
		...subTaskToAdd,
		finishDate,
		id: uuid()
	};

	(client as OldSchoolBotClient).minionActivityCache.set(newSubtask.userID, newSubtask);

	return (client as OldSchoolBotClient).boss.publishAfter(
		'minionActivity',
		newSubtask,
		{},
		new Date(finishDate)
	);
}
