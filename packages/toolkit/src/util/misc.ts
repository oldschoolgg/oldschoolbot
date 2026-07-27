import emojiRegex from 'emoji-regex';

const rawEmojiRegex = emojiRegex();

export function stripEmojis(str: string): string {
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

export const alphabeticalSort = (a: string, b: string): number => a.localeCompare(b);

export function getInterval(intervalHours: number): { start: Date; end: Date } {
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
		end: endInterval
	};
}

export function getNextUTCReset(last_timeStamp: number, cd: number): number {
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

export function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function noOp(): void {}

/**
 * Shows what percentage a value is of a total value, for example calculating what percentage of 20 is 5? (25%)
 * @param partialValue The partial value of the total number, that you want to know what its percentage of the total is.
 * @param totalValue The total value, that the partial value is a part of.
 */
export function calcWhatPercent(partialValue: number, totalValue: number): number {
	return (100 * partialValue) / totalValue;
}

/**
 * Calculates what a X% of a total number is, for example calculating what is 20% of 100
 * @param percent The percentage (%) you want to calculate.
 * @param valueToCalc The total number that you want to get the percentage of.
 */
export function calcPercentOfNum(percent: number, valueToCalc: number): number {
	return (percent * valueToCalc) / 100;
}

/**
 * Reduces a number by a percentage of itself.
 * @param value, The number to be reduced.
 * @param percent The percent you want the value to be reduced by.
 */
export function reduceNumByPercent(value: number, percent: number): number {
	if (percent <= 0) return value;
	return value - value * (percent / 100);
}

/**
 * Increases a number by a percentage of itself.
 * @param value, The number to be increased.
 * @param percent The percent you want the value to be increased by.
 */
export function increaseNumByPercent(value: number, percent: number): number {
	if (percent <= 0) return value;
	return value + value * (percent / 100);
}

export function objectValues<T extends object>(obj: T): { [K in keyof T]-?: T[K] }[keyof T][] {
	const keys = Object.keys(obj) as (keyof T)[];
	const out = [] as { [K in keyof T]-?: T[K] }[keyof T][];
	for (const k of keys) out.push(obj[k]);
	return out;
}

export function objectEntries<T extends object>(obj: T): { [K in keyof T]-?: [K, T[K]] }[keyof T][] {
	const keys = Object.keys(obj) as (keyof T)[];
	const out = [] as { [K in keyof T]-?: [K, T[K]] }[keyof T][];
	for (const k of keys) out.push([k, obj[k]]);
	return out;
}

/**
 * Rounds a number to a given precision.
 *
 * @param value The number to be rounded.
 * @param precision The precision of the rounding.
 */
export function round(value: number, precision = 1): number {
	const multiplier = Math.pow(10, precision || 0);
	return Math.round(value * multiplier) / multiplier;
}

export const debounce = <F extends (...args: any[]) => any>(fn: F, waitFor: number) => {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	const debounced = (...args: Parameters<F>) => {
		if (timeout !== null) {
			clearTimeout(timeout);
			timeout = null;
		}
		timeout = setTimeout(() => fn(...args), waitFor);
	};

	return debounced as (...args: Parameters<F>) => ReturnType<F>;
};

export function scaleNumber(num: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
	return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export function stripNonAlphanumeric(str: string): string {
	return str.replace(/[^a-zA-Z0-9]/g, '');
}

export function rewriteSqlToIdempotent(sql: string): string {
	const rules: [RegExp, string | ((...a: any[]) => string)][] = [
		[/\bCREATE\s+TABLE\s+("?[\w]+"?)/gi, 'CREATE TABLE IF NOT EXISTS $1'],
		[/\bCREATE\s+UNIQUE\s+INDEX\s+("?[\w]+"?)/gi, 'CREATE UNIQUE INDEX IF NOT EXISTS $1'],
		[/\bCREATE\s+INDEX\s+("?[\w]+"?)/gi, 'CREATE INDEX IF NOT EXISTS $1'],
		[/\bCREATE\s+SCHEMA\s+("?[\w]+"?)/gi, 'CREATE SCHEMA IF NOT EXISTS $1'],
		[/\bCREATE\s+VIEW\s+("?[\w]+"?)/gi, 'CREATE OR REPLACE VIEW $1'],
		[
			/\bCREATE\s+TYPE\s+("?[\w]+"?)\s+AS\s+ENUM\s*\(([^;]+)\);/gi,
			(_m, name, values) =>
				`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = ${name.replace(/"/g, "'")}) THEN
        CREATE TYPE ${name} AS ENUM (${values.trim()});
    END IF;
END $$;`
		],
		[
			/\bALTER\s+TABLE\s+("?[\w]+"?)\s+ADD\s+CONSTRAINT\s+("?[\w]+"?)([^;]*);/gi,
			(_m, table, constraint, rest) =>
				`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${constraint};
ALTER TABLE ${table} ADD CONSTRAINT ${constraint}${rest.trim()};`
		]
	];
	for (const [r, sub] of rules) {
		sql = typeof sub === 'string' ? sql.replace(r, sub) : sql.replace(r, (...a) => sub(...a));
	}
	return sql;
}

export function cleanUsername(username: string): string {
	return stripEmojis(username).replace(/[@|*]/g, '').substring(0, 32);
}
