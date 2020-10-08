import {Client} from 'discord.js';
import {KlasaClient} from 'klasa';

import {Tasks} from '../constants';
import {publish} from '../pgBoss';
import {ActivityTaskOptions} from '../types/minions';
import {uuid} from '../util';
import getActivityOfUser from './getActivityOfUser';
import {taskNameFromType} from './taskNameFromType';

export default async function addSubTaskToActivityTask<T extends ActivityTaskOptions>(
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

	const newSubtask: ActivityTaskOptions = {
		...subTaskToAdd,
		finishDate: Date.now() + subTaskToAdd.duration,
		id: uuid()
	};

	return publish(client as KlasaClient, taskName, newSubtask, taskNameFromType(newSubtask.type));
}
