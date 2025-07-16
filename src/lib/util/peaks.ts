import { Emoji } from '@oldschoolgg/toolkit/constants';
import { toTitleCase } from '@oldschoolgg/toolkit/string-util';
import { Time } from 'e';

import { time } from 'discord.js';
import { SeededRNG } from './rng';

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

function getSeedFromDate(date: Date): number {
	const year = date.getUTCFullYear();
	const month = date.getUTCMonth() + 1;
	const day = date.getUTCDate();
	return year * 10000 + month * 100 + day;
}

export function generateDailyPeakIntervals(date: Date = new Date()): { peaks: Peak[]; currentPeak: Peak } {
	const seed = getSeedFromDate(date);
	const rng = new SeededRNG(seed);
	const peakTiers: PeakTier[] = [PeakTier.High, PeakTier.Medium, PeakTier.Low];

	let hoursUsed = 0;
	let peaks: Peak[] = [];

	for (let i = 0; i < 10; i++) {
		const duration = rng.nextInt(1, 2);
		const peakTier = rng.shuffle(peakTiers)[0];
		peaks.push({ startTime: duration, finishTime: duration, peakTier });
		hoursUsed += duration;
	}

	const finalDuration = 24 - hoursUsed;
	if (finalDuration > 0) {
		peaks.push({ startTime: finalDuration, finishTime: finalDuration, peakTier: PeakTier.Low });
	}

	peaks = rng.shuffle(peaks);

	let current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
	for (const p of peaks) {
		p.startTime = current;
		current += p.finishTime * Time.Hour;
		p.finishTime = current;
	}

	return {
		peaks,
		currentPeak: peaks.find(p => p.startTime <= Date.now() && p.finishTime >= Date.now()) || peaks[0]
	};
}

export function getPeakTimesString(): string {
	let str = '';
	for (const peak of generateDailyPeakIntervals().peaks) {
		str += `${Emoji.Stopwatch} **${toTitleCase(peak.peakTier)}** peak time: ${time(
			new Date(peak.startTime),
			'T'
		)} to ${time(new Date(peak.finishTime), 'T')} (**${Math.round(
			(peak.finishTime - peak.startTime) / Time.Hour
		)}** hour peak ${time(new Date(peak.startTime), 'R')})\n`;
	}

	return str;
}
