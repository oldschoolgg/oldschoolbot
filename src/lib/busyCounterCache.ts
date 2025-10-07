export function baseModifyBusyCounter(map: Map<string, number>, userID: string, amount: -1 | 1) {
	const entry = map.get(userID);
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
