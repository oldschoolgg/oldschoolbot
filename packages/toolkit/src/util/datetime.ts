import { Time } from 'e';

export function isAtleastThisOld(date: Date | number, expectedAgeInMS: number) {
	const difference = Date.now() - (typeof date === 'number' ? date : date.getTime());
	return difference >= expectedAgeInMS;
}

export function isWeekend() {
	const currentDate = new Date(Date.now() - Time.Hour * 6);
	return [6, 0].includes(currentDate.getDay());
}

export function calcPerHour(value: number, duration: number) {
	return (value / (duration / Time.Minute)) * 60;
}

export function formatDuration(ms: number, short = false, precise = false) {
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
