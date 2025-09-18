import { time } from 'discord.js';
import emojiRegex from 'emoji-regex';

const rawEmojiRegex = emojiRegex();

export function stripEmojis(str: string) {
	return str.replace(rawEmojiRegex, '');
}

export function roboChimpCLRankQuery(userID: bigint) {
	return `SELECT COUNT(*)::int
FROM public.user
WHERE ((osb_cl_percent + bso_cl_percent) / 2) >= (
												  SELECT (((COALESCE(osb_cl_percent, 0)) + (COALESCE(bso_cl_percent, 0))) / 2)
												  FROM public.user
												  WHERE id = ${userID}
												 );`;
}

const englishOrdinalRules = new Intl.PluralRules('en', { type: 'ordinal' });

const suffixes: { [key: string]: string } = {
	one: 'st',
	two: 'nd',
	few: 'rd',
	other: 'th'
};

export function formatOrdinal(number: number): string {
	const suffix = suffixes[englishOrdinalRules.select(number)];
	return `${number}${suffix}`;
}

export enum PerkTier {
	/**
	 * Boosters
	 */
	One = 1,
	/**
	 * Tier 1 Patron
	 */
	Two = 2,
	/**
	 * Tier 2 Patron, Contributors, Mods
	 */
	Three = 3,
	/**
	 * Tier 3 Patron
	 */
	Four = 4,
	/**
	 * Tier 4 Patron
	 */
	Five = 5,
	/**
	 * Tier 5 Patron
	 */
	Six = 6,
	/**
	 * Tier 6 Patron
	 */
	Seven = 7
}

export const alphabeticalSort = (a: string, b: string) => a.localeCompare(b);

export function dateFm(date: Date) {
	return `${time(date, 'T')} (${time(date, 'R')})`;
}

export function getInterval(intervalHours: number) {
	const currentTime = new Date();
	const currentHour = currentTime.getHours();

	// Find the nearest interval start hour (0, intervalHours, 2*intervalHours, etc.)
	const startHour = currentHour - (currentHour % intervalHours);
	const startInterval = new Date(currentTime);
	startInterval.setHours(startHour, 0, 0, 0);

	const endInterval = new Date(startInterval);
	endInterval.setHours(startHour + intervalHours);

	return {
		start: startInterval,
		end: endInterval,
		nextResetStr: dateFm(endInterval)
	};
}

export function getNextUTCReset(last_timeStamp: number, cd: number) {
	const coolDownEnd = new Date(last_timeStamp + cd);

	const nextUTCReset = new Date(
		Date.UTC(coolDownEnd.getUTCFullYear(), coolDownEnd.getUTCMonth(), coolDownEnd.getUTCDate(), 0, 0, 0, 0)
	);

	return nextUTCReset.getTime();
}

export function objHasAnyPropInCommon(obj: object, other: object): boolean {
	for (const key of Object.keys(obj)) {
		if (key in other) return true;
	}
	return false;
}

export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noOp() {}
