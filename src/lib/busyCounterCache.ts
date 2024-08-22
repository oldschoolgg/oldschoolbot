export function baseModifyBusyCounter(map: Map<string, number>, userID: string, amount: -1 | 1) {
	const entry = map.get(userID);
	// if (entry) {
	// assert(entry >= 1, 'Busy counter should be no less than 1');
	// }
	// if (amount === -1) {
	// assert(entry !== undefined && entry > 0, `Tried to decrement busy counter by 1, when its ${entry}`);
	// }
	if (!entry) {
		map.set(userID, amount);
		return amount;
	}

	const newCounter = entry + amount;
	map.set(userID, newCounter);
	return newCounter;
}

function getBusyCounter(userID: string) {
	return globalClient.busyCounterCache.get(userID) ?? 0;
}
export function modifyBusyCounter(userID: string, amount: -1 | 1) {
	return baseModifyBusyCounter(globalClient.busyCounterCache, userID, amount);
}
export function userIsBusy(userID: string) {
	return getBusyCounter(userID) > 0;
}
