import type { Peak } from './tickers';

export function getCurrentPeak() {
	const cachedPeakInterval: Peak[] = globalClient._peakIntervalCache;
	let currentPeak = cachedPeakInterval[0];
	const date = new Date().getTime();
	for (const peak of cachedPeakInterval) {
		if (peak.startTime < date && peak.finishTime > date) {
			currentPeak = peak;
			break;
		}
	}

	return currentPeak;
}
