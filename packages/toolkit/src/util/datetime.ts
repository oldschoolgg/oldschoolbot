import { PerkTier } from './misc.js';

export enum Time {
	Millisecond = 1,
	Second = 1000,
	Minute = 1000 * 60,
	Hour = 1000 * 60 * 60,
	Day = 1000 * 60 * 60 * 24,
	Month = 1000 * 60 * 60 * 24 * 30,
	Year = 1000 * 60 * 60 * 24 * 365
}

export function isAtleastThisOld(date: Date | number, expectedAgeInMS: number): boolean {
	const difference = Date.now() - (typeof date === 'number' ? date : date.getTime());
	return difference >= expectedAgeInMS;
}

export function isWeekend(): boolean {
	const currentDate = new Date();
	return [6, 0].includes(currentDate.getUTCDay());
}

export function calcPerHour(value: number, duration: number): number {
	return (value / (duration / Time.Minute)) * 60;
}

export function timeOnly(date: Date): string {
	const unixSeconds = Math.floor(date.getTime() / 1000);
	return `<t:${unixSeconds}:t>`;
}

export function formatDuration(ms: number, short = false, precise = false): string {
	if (ms < 0) ms = -ms;
	const time = {
		day: Math.floor(ms / 86_400_000),
		hour: Math.floor(ms / 3_600_000) % 24,
		minute: Math.floor(ms / 60_000) % 60,
		second: Math.floor(ms / 1000) % 60
	};
	const shortTime = {
		d: Math.floor(ms / 86_400_000),
		h: Math.floor(ms / 3_600_000) % 24,
		m: Math.floor(ms / 60_000) % 60,
		s: Math.floor(ms / 1000) % 60
	};
	const nums = Object.entries(short ? shortTime : time).filter(val => val[1] !== 0);
	if (nums.length === 0) {
		return precise ? `${ms}ms` : 'less than 1 second';
	}
	return nums
		.map(([key, val]) => `${val}${short ? '' : ' '}${key}${val === 1 || short ? '' : 's'}`)
		.join(short ? '' : ', ');
}

export function formatDurationWithTimestamp(durationMs: number, perkTier: number, showTimestamp: boolean): string {
	const duration = formatDuration(durationMs);
	if (perkTier >= PerkTier.Four && showTimestamp) {
		const finishDate = new Date(Date.now() + durationMs);
		return `${duration} (${timeOnly(finishDate)})`;
	}
	return duration;
}
