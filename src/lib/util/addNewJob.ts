import { KlasaClient } from 'klasa';

import { Listeners } from '../PgBoss/PgBoss';
import { ActivityJobOptions } from '../types/minions';
import { uuid } from '../util';
import getActivityOfUser from './getActivityOfUser';

export default async function addNewJob<T extends ActivityJobOptions>(
	client: KlasaClient,
	listenerName: Listeners,
	subTaskToAdd: Omit<T, 'finishDate' | 'id'>
) {
	const usersTask = getActivityOfUser(client, subTaskToAdd.userID);
	if (usersTask) {
		throw `That user is busy, so they can't do this minion activity.`;
	}
	if (!Object.values(Listeners).includes(listenerName)) {
		throw `Invalid listener [${listenerName}]. This task will not be executed. Contact the Dev. team and report this issue.`;
	}
	return client.pgBoss.addJob(client as KlasaClient, listenerName, {
		...subTaskToAdd,
		finishDate: Date.now() + subTaskToAdd.duration,
		id: uuid()
	});
}
