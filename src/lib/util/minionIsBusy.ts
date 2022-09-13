import { getActivityOfUser } from '../settings/settings';

export function minionIsBusy(userID: bigint | string): boolean {
	const usersTask = getActivityOfUser(userID.toString());
	return Boolean(usersTask);
}
