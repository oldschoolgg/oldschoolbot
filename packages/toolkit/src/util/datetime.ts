import { PerkTier } from './misc.js';

export enum Time {
	Millisecond = 1,
	Second = 1000,
	Minute = 1000 * 60,
	Hour = 1000 * 60 * 60,
	Day = 1000 * 60 * 60 * 24,
	Week = 1000 * 60 * 60 * 24 * 7,
	Month = 1000 * 60 * 60 * 24 * 30,
	Year = 1000 * 60 * 60 * 24 * 365
}

const durationUnitMultipliers: Record<string, number> = {
	ms: Time.Millisecond,
	millisecond: Time.Millisecond,
	milliseconds: Time.Millisecond,
	s: Time.Second,
	sec: Time.Second,
	secs: Time.Second,
	second: Time.Second,
	seconds: Time.Second,
	m: Time.Minute,
	min: Time.Minute,
	mins: Time.Minute,
	minute: Time.Minute,
	minutes: Time.Minute,
	h: Time.Hour,
	hr: Time.Hour,
	hrs: Time.Hour,
	hour: Time.Hour,
	hours: Time.Hour,
	d: Time.Day,
	day: Time.Day,
	days: Time.Day,
	w: Time.Week,
	week: Time.Week,
	weeks: Time.Week,
	mo: Time.Month,
	month: Time.Month,
	months: Time.Month,
	y: Time.Year,
	yr: Time.Year,
	yrs: Time.Year,
	year: Time.Year,
	years: Time.Year
};

export function parseDuration(input: string): number {
	const trimmed = input.trim().toLowerCase();
	if (trimmed.length === 0) return 0;

	const sign = trimmed.startsWith('-') ? -1 : 1;
	const duration = sign === -1 ? trimmed.slice(1).trimStart() : trimmed;
	if (duration.length === 0) return 0;

	let total = 0;
	let consumedLength = 0;
	const regex = /(\d+(?:\.\d+)?)\s*(milliseconds?|ms|seconds?|secs?|s|months?|mo|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)/gy;

	while (consumedLength < duration.length) {
		regex.lastIndex = consumedLength;
		const match = regex.exec(duration);
		if (!match) return 0;

		const amount = Number(match[1]);
		const multiplier = durationUnitMultipliers[match[2]];
		if (!Number.isFinite(amount) || multiplier === undefined) return 0;

		total += amount * multiplier;
		consumedLength = regex.lastIndex;
		while (duration[consumedLength] === ' ') consumedLength++;
	}

	return sign * total;
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

export function relativeTimestamp(date: Date): string {
	const unixSeconds = Math.floor(date.getTime() / 1000);
	return `<t:${unixSeconds}:R>`;
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

export function formatDurationWithTimestamp(
	durationMs: number,
	perkTier: number,
	disableShowTimestamp: boolean
): string {
	const duration = formatDuration(durationMs);
	if (perkTier >= PerkTier.Two && !disableShowTimestamp) {
		const finishDate = new Date(Date.now() + durationMs);
		return `${relativeTimestamp(finishDate)} (${timeOnly(finishDate)})`;
	}
	return duration;
}
