export interface Peak {
	startTime: number;
	finishTime: number;
	peakTier: PeakTier;
}

export enum PeakTier {
	High = 'high',
	Medium = 'medium',
	Low = 'low'
}

export const peakFactor = [
	{
		peakTier: PeakTier.High,
		factor: 2.5
	},
	{
		peakTier: PeakTier.Medium,
		factor: 1
	},
	{
		peakTier: PeakTier.Low,
		factor: 0.2
	}
];

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
