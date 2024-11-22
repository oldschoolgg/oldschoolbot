import { ApplicationCommandOptionType, time } from 'discord.js';
import { notEmpty, randArrItem, randInt, shuffleArr } from 'e';
import type { CommandOption } from '../lib/MahojiClient/mahojiTypes';
import { randomSnowflake } from './discord';

const emojiRegex = require('emoji-regex');

const rawEmojiRegex = emojiRegex();

export function stripEmojis(str: string) {
	return str.replace(rawEmojiRegex, '');
}

export function cleanString(str: string) {
	return str.replace(/[^0-9a-zA-Z+]/gi, '').toUpperCase();
}

export function stringMatches(str: string | number = '', str2: string | number = '') {
	return cleanString(str.toString()) === cleanString(str2.toString());
}

export function replaceWhitespaceAndUppercase(str: string): string {
	return str.replace(/\s/g, '').toUpperCase();
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

export function toTitleCase(str: string) {
	const splitStr = str.toLowerCase().split(' ');
	for (let i = 0; i < splitStr.length; i++) {
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	return splitStr.join(' ');
}

const validChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function miniID(length: number): string {
	let id = '';

	for (let i = 0; i < length; i++) {
		const randomChar = validChars[Math.floor(Math.random() * validChars.length)];

		id += randomChar;
	}

	return id;
}

export function truncateString(str: string, maxLen: number) {
	if (str.length < maxLen) return str;
	return `${str.slice(0, maxLen - 3)}...`;
}

export function splitMessage(text: string, { maxLength = 2000, char = '\n', prepend = '', append = '' } = {}) {
	if (text.length <= maxLength) return [text];
	let splitText: string[] = [text];
	if (Array.isArray(char)) {
		while (char.length > 0 && splitText.some(elem => elem.length > maxLength)) {
			const currentChar = char.shift();
			if (currentChar instanceof RegExp) {
				splitText = splitText.flatMap(chunk => chunk.match(currentChar)).filter(notEmpty);
			} else {
				splitText = splitText.flatMap(chunk => chunk.split(currentChar));
			}
		}
	} else {
		splitText = text.split(char);
	}
	if (splitText.some(elem => elem.length > maxLength)) throw new RangeError('SPLIT_MAX_LEN');
	const messages = [];
	let msg = '';
	for (const chunk of splitText) {
		if ((msg + char + chunk + append).length > maxLength) {
			messages.push(msg + append);
			msg = prepend;
		}
		msg += (msg !== prepend ? char : '') + chunk;
	}
	return messages.concat(msg).filter(m => m);
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

export function exponentialPercentScale(percent: number, decay = 0.021) {
	return 100 * Math.pow(Math.E, -decay * (100 - percent));
}

export function normal(mu = 0, sigma = 1, nsamples = 6) {
	let run_total = 0;

	for (let i = 0; i < nsamples; i++) {
		run_total += Math.random();
	}

	return (sigma * (run_total - nsamples / 2)) / (nsamples / 2) + mu;
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

type CommandInput = Record<string, any>;
export async function generateCommandInputs(options: readonly CommandOption[]): Promise<CommandInput[]> {
	const results: CommandInput[] = [];
	const allPossibleOptions: Record<string, any[]> = {};

	for (const option of options) {
		switch (option.type) {
			case ApplicationCommandOptionType.SubcommandGroup:
			case ApplicationCommandOptionType.Subcommand:
				if (option.options) {
					const subOptionsResults = await generateCommandInputs(option.options);
					results.push(...subOptionsResults.map(input => ({ [option.name]: input })));
				}
				break;
			case ApplicationCommandOptionType.String:
				if ('autocomplete' in option && option.autocomplete) {
					const autoCompleteResults = await option.autocomplete(
						'',
						{ id: randomSnowflake() } as any,
						{} as any
					);
					allPossibleOptions[option.name] = shuffleArr(autoCompleteResults.map(c => c.value)).slice(0, 3);
				} else if (option.choices) {
					allPossibleOptions[option.name] = option.choices.map(c => c.value).slice(0, 3);
				} else if (['guild_id', 'message_id'].includes(option.name)) {
					allPossibleOptions[option.name] = ['157797566833098752'];
				} else {
					allPossibleOptions[option.name] = ['plain string'];
				}
				break;
			case ApplicationCommandOptionType.Integer:
			case ApplicationCommandOptionType.Number:
				if (option.choices) {
					allPossibleOptions[option.name] = option.choices.map(c => c.value);
				} else {
					let value = randInt(1, 10);
					if (option.min_value && option.max_value) {
						value = randInt(option.min_value, option.max_value);
					}
					allPossibleOptions[option.name] = [option.min_value, value];
				}
				break;
			case ApplicationCommandOptionType.Boolean: {
				allPossibleOptions[option.name] = [true, false];
				break;
			}
			case ApplicationCommandOptionType.User: {
				allPossibleOptions[option.name] = [
					{
						user: {
							id: '425134194436341760',
							username: 'username',
							bot: false
						},
						member: undefined
					}
				];
				break;
			}
			case ApplicationCommandOptionType.Channel:
			case ApplicationCommandOptionType.Role:
			case ApplicationCommandOptionType.Mentionable:
				// results.push({ ...currentPath, [option.name]: `Any ${option.type}` });
				break;
		}
	}

	const sorted = Object.values(allPossibleOptions).sort((a, b) => b.length - a.length);
	const longestOptions = sorted[0]?.length;
	for (let i = 0; i < longestOptions; i++) {
		const obj: Record<string, any> = {};
		for (const [key, val] of Object.entries(allPossibleOptions)) {
			obj[key] = val[i] ?? randArrItem(val);
		}
		results.push(obj);
	}
	return results;
}
