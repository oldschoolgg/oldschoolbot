import { getActivityOfUser } from '../settings/settings';

export function minionIsBusy(userID: string | string): boolean {
	const usersTask = getActivityOfUser(userID.toString());
	return Boolean(usersTask);
}
