import { busyUsers } from '@/lib/cache.js';

export function modifyUserBusy({
	reason,
	userID,
	type
}: {
	type: 'lock' | 'unlock';
	userID: string;
	reason: string;
}): void {
	Logging.logDebug(`ModifyUserBusy UserID[${userID}] Type[${type}] Reason[${reason}]`, {
		type: 'MODIFY_USER_BUSY',
		user_id: userID
	});
	const isBusy = busyUsers.has(userID);

	switch (type) {
		case 'lock': {
			if (isBusy) {
				Logging.logDebug(`Tried to busy-lock an already busy user. UserID[${userID}] Reason[${reason}]`);
				return;
			} else {
				busyUsers.add(userID);
			}
			break;
		}
		case 'unlock': {
			if (!isBusy) {
				Logging.logDebug(`Tried to unlock an already unlocked user. UserID[${userID}] Reason[${reason}]`);
				return;
			} else {
				busyUsers.delete(userID);
			}
			break;
		}
	}
}

export function userIsBusy(userID: string): boolean {
	return busyUsers.has(userID);
}
