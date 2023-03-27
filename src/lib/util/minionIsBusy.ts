import { minionActivityCache } from '../constants';

export function minionIsBusy(userID: string | string): boolean {
	const usersTask = getActivityOfUser(userID.toString());
	return Boolean(usersTask);
}

export function getActivityOfUser(userID: string) {
	const task = minionActivityCache.get(userID);
	return task ?? null;
}
