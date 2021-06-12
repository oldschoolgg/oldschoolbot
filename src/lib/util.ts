import crypto from 'crypto';
import { Channel, Client, DMChannel, Guild, TextChannel } from 'discord.js';
import { objectEntries, randInt, shuffleArr } from 'e';
import { KlasaClient, KlasaUser, SettingsFolder, util } from 'klasa';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import Items from 'oldschooljs/dist/structures/Items';
import { bool, integer, nodeCrypto, real } from 'random-js';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const emojiRegex = require('emoji-regex');

import {
	CENA_CHARS,
	continuationChars,
	Events,
	PerkTier,
	skillEmoji,
	SupportServer,
	Time
} from './constants';
import { hasItemEquipped } from './gear';
import { GearSetupTypes } from './gear/types';
import { ArrayItemsResolved, ItemTuple, Skills } from './types';
import { GroupMonsterActivityTaskOptions } from './types/minions';
import itemID from './util/itemID';
import resolveItems from './util/resolveItems';

export * from 'oldschooljs/dist/util/index';
export { Util } from 'discord.js';

const zeroWidthSpace = '\u200b';

export function cleanMentions(guild: Guild | null, input: string, showAt = true) {
	const at = showAt ? '@' : '';
	return input
		.replace(/@(here|everyone)/g, `@${zeroWidthSpace}$1`)
		.replace(/<(@[!&]?|#)(\d{17,19})>/g, (match, type, id) => {
			switch (type) {
				case '@':
				case '@!': {
					const tag = guild?.client.users.cache.get(id);
					return tag ? `${at}${tag.username}` : `<${type}${zeroWidthSpace}${id}>`;
				}
				case '@&': {
					const role = guild?.roles.cache.get(id);
					return role ? `${at}${role.name}` : match;
				}
				case '#': {
					const channel = guild?.channels.cache.get(id);
					return channel ? `#${channel.name}` : `<${type}${zeroWidthSpace}${id}>`;
				}
				default:
					return `<${type}${zeroWidthSpace}${id}>`;
			}
		});
}

export function generateHexColorForCashStack(coins: number) {
	if (coins > 9999999) {
		return '#00FF80';
	}

	if (coins > 99999) {
		return '#FFFFFF';
	}

	return '#FFFF00';
}

export function formatItemStackQuantity(quantity: number) {
	if (quantity > 9999999) {
		return `${Math.floor(quantity / 1000000)}M`;
	} else if (quantity > 99999) {
		return `${Math.floor(quantity / 1000)}K`;
	}
	return quantity.toString();
}

export function randomItemFromArray<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

export function toTitleCase(str: string) {
	const splitStr = str.toLowerCase().split(' ');
	for (let i = 0; i < splitStr.length; i++) {
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	return splitStr.join(' ');
}

export function cleanString(str: string) {
	return str.replace(/[^0-9a-zA-Z+]/gi, '').toUpperCase();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function noOp(_any: any) {
	return undefined;
}

export function stringMatches(str: string, str2: string) {
	return cleanString(str) === cleanString(str2);
}

export function bankToString(bank: ItemBank, chunkSize?: number) {
	const display = [];
	for (const [itemID, qty] of Object.entries(bank)) {
		const item = Items.get(parseInt(itemID));
		if (!item) continue;
		display.push(`**${item.name}:** ${qty.toLocaleString()}`);
	}
	return chunkSize ? util.chunk(display, chunkSize) : display;
}

export function formatDuration(ms: number) {
	if (ms < 0) ms = -ms;
	const time = {
		day: Math.floor(ms / 86400000),
		hour: Math.floor(ms / 3600000) % 24,
		minute: Math.floor(ms / 60000) % 60,
		second: Math.floor(ms / 1000) % 60
	};
	let nums = Object.entries(time).filter(val => val[1] !== 0);
	if (nums.length === 0) return '1 second';
	return nums.map(([key, val]) => `${val} ${key}${val === 1 ? '' : 's'}`).join(', ');
}

export function inlineCodeblock(input: string) {
	return `\`${input.replace(/ /g, '\u00A0').replace(/`/g, '`\u200B')}\``;
}

export function saveCtx(ctx: any) {
	const props = [
		'fillStyle',
		'globalAlpha',
		'globalCompositeOperation',
		'font',
		'textAlign',
		'textBaseline',
		'direction',
		'imageSmoothingEnabled'
	];
	const state: { [key: string]: any } = {};
	for (const prop of props) {
		state[prop] = ctx[prop];
	}
	return state;
}

export function restoreCtx(ctx: any, state: any) {
	for (const prop of Object.keys(state)) {
		ctx[prop] = state[prop];
	}
}

export function isWeekend() {
	const currentDate = new Date();
	return currentDate.getDay() === 6 || currentDate.getDay() === 0;
}

export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function saidYes(content: string) {
	const newContent = content.toLowerCase();
	return newContent === 'y' || newContent === 'yes';
}

export function removeDuplicatesFromArray<T>(arr: readonly T[]): T[] {
	return [...new Set(arr)];
}

export function convertXPtoLVL(xp: number, cap = 99) {
	let points = 0;

	for (let lvl = 1; lvl <= cap; lvl++) {
		points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));

		if (Math.floor(points / 4) >= xp + 1) {
			return lvl;
		}
	}

	return cap;
}

export function determineScaledOreTime(xp: number, respawnTime: number, lvl: number) {
	const t = xp / (lvl / 4 + 0.5) + ((100 - lvl) / 100 + 0.75);
	return Math.floor((t + respawnTime) * 1000) * 1.2;
}
export function determineScaledLogTime(xp: number, respawnTime: number, lvl: number) {
	const t = xp / (lvl / 4 + 0.5) + ((100 - lvl) / 100 + 0.75);
	return Math.floor((t + respawnTime) * 1000) * 1.2;
}

export function rand(min: number, max: number) {
	return integer(min, max)(nodeCrypto);
}

export function randFloat(min: number, max: number) {
	return real(min, max)(nodeCrypto);
}

export function percentChance(percent: number) {
	return bool(percent / 100)(nodeCrypto);
}

export function roll(max: number) {
	return rand(1, max) === 1;
}

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
	return value !== null && value !== undefined;
}

export function itemNameFromID(itemID: number | string) {
	return Items.get(itemID)?.name;
}

export function floatPromise(ctx: { client: Client }, promise: Promise<unknown>) {
	if (util.isThenable(promise)) promise.catch(error => ctx.client.emit(Events.Wtf, error));
}

export function addArrayOfNumbers(arr: number[]) {
	return arr.reduce((a, b) => a + b, 0);
}

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
 * @param percent The total number that you want to get the percentage of.
 */
export function reduceNumByPercent(value: number, percent: number): number {
	if (percent <= 0) return value;
	if (percent >= 100) return 0;
	return value - value * (percent / 100);
}

export async function arrIDToUsers(client: KlasaClient, ids: string[]) {
	return Promise.all(ids.map(id => client.users.fetch(id)));
}

const rawEmojiRegex = emojiRegex();

export function stripEmojis(str: string) {
	return str.replace(rawEmojiRegex, '');
}

export function round(value = 1, precision = 1) {
	const multiplier = Math.pow(10, precision || 0);
	return Math.round(value * multiplier) / multiplier;
}

export const anglerBoosts = [
	[itemID('Angler hat'), 0.4],
	[itemID('Angler top'), 0.8],
	[itemID('Angler waders'), 0.6],
	[itemID('Angler boots'), 0.2]
];

export function anglerBoostPercent(user: KlasaUser) {
	const skillingSetup = user.getGear('skilling');
	let amountEquipped = 0;
	let boostPercent = 0;
	for (const [id, percent] of anglerBoosts) {
		if (hasItemEquipped(id, skillingSetup)) {
			boostPercent += percent;
			amountEquipped++;
		}
	}
	if (amountEquipped === 4) {
		boostPercent += 0.5;
	}
	return round(boostPercent, 1);
}

const rogueOutfit = resolveItems([
	'Rogue mask',
	'Rogue top',
	'Rogue trousers',
	'Rogue gloves',
	'Rogue boots'
]);

export function rogueOutfitPercentBonus(user: KlasaUser): number {
	const skillingSetup = user.getGear('skilling');
	let amountEquipped = 0;
	for (const id of rogueOutfit) {
		if (hasItemEquipped(id, skillingSetup)) {
			amountEquipped++;
		}
	}
	return amountEquipped * 20;
}

export function rollRogueOutfitDoubleLoot(user: KlasaUser): boolean {
	return randInt(1, 100) <= rogueOutfitPercentBonus(user);
}

export function generateContinuationChar(user: KlasaUser) {
	const baseChar =
		user.perkTier > PerkTier.One
			? 'y'
			: Date.now() - user.createdTimestamp < Time.Month * 6
			? shuffleArr(continuationChars).slice(0, randInt(1, 2)).join('')
			: randomItemFromArray(continuationChars);

	return `${shuffleArr(CENA_CHARS).slice(0, randInt(1, 2)).join('')}${baseChar}${shuffleArr(
		CENA_CHARS
	)
		.slice(0, randInt(1, 2))
		.join('')}`;
}

export function isValidGearSetup(str: string): str is GearSetupTypes {
	return ['melee', 'mage', 'range', 'skilling', 'misc'].includes(str);
}

/**
 * Adds random variation to a number. For example, if you pass 10%, it can at most lower the value by 10%,
 * or increase it by 10%, and everything in between.
 * @param value The value to add variation too.
 * @param percentage The max percentage to fluctuate the value by, in both negative/positive.
 */
export function randomVariation(value: number, percentage: number) {
	const lowerLimit = value * (1 - percentage / 100);
	const upperLimit = value * (1 + percentage / 100);
	return randFloat(lowerLimit, upperLimit);
}

export function isGroupActivity(data: any): data is GroupMonsterActivityTaskOptions {
	return 'users' in data;
}

export function sha256Hash(x: string) {
	return crypto.createHash('sha256').update(x, 'utf8').digest('hex');
}

export function countSkillsAtleast99(user: KlasaUser) {
	const skills = (user.settings.get('skills') as SettingsFolder).toJSON() as Record<
		string,
		number
	>;
	return Object.values(skills).filter(xp => convertXPtoLVL(xp) >= 99).length;
}

export function getSupportGuild(client: Client) {
	const guild = client.guilds.cache.get(SupportServer);
	if (!guild) throw `Can't find support guild.`;
	return guild;
}

export function normal(mu = 0, sigma = 1, nsamples = 6) {
	let run_total = 0;

	for (let i = 0; i < nsamples; i++) {
		run_total += Math.random();
	}

	return (sigma * (run_total - nsamples / 2)) / (nsamples / 2) + mu;
}

/**
 * Checks if the bot can send a message to a channel object.
 * @param channel The channel to check if the bot can send a message to.
 */
export function channelIsSendable(channel: Channel | undefined): channel is TextChannel {
	if (
		!channel ||
		(!(channel instanceof DMChannel) && !(channel instanceof TextChannel)) ||
		!channel.postable
	) {
		return false;
	}

	return true;
}
export function calcCombatLevel(skills: Skills) {
	const defence = skills.defence ? convertXPtoLVL(skills.defence) : 1;
	const ranged = skills.ranged ? convertXPtoLVL(skills.ranged) : 1;
	const hitpoints = skills.hitpoints ? convertXPtoLVL(skills.hitpoints) : 1;
	const magic = skills.magic ? convertXPtoLVL(skills.magic) : 1;
	const prayer = skills.prayer ? convertXPtoLVL(skills.prayer) : 1;
	const attack = skills.attack ? convertXPtoLVL(skills.attack) : 1;
	const strength = skills.strength ? convertXPtoLVL(skills.strength) : 1;

	const base = 0.25 * (defence + hitpoints + Math.floor(prayer / 2));
	const melee = 0.325 * (attack + strength);
	const range = 0.325 * (Math.floor(ranged / 2) + ranged);
	const mage = 0.325 * (Math.floor(magic / 2) + magic);
	return Math.floor(base + Math.max(melee, range, mage));
}
export function skillsMeetRequirements(skills: Skills, requirements: Skills) {
	for (const [skillName, level] of objectEntries(requirements)) {
		if ((skillName as string) === 'combat') {
			if (calcCombatLevel(skills) < level!) return false;
		} else {
			const xpHas = skills[skillName];
			const levelHas = convertXPtoLVL(xpHas ?? 1, 120);
			if (levelHas < level!) return false;
		}
	}
	return true;
}

export function formatItemReqs(items: ArrayItemsResolved) {
	const str = [];
	for (const item of items) {
		if (Array.isArray(item)) {
			str.push(item.map(itemNameFromID).join(' OR '));
		} else {
			str.push(itemNameFromID(item));
		}
	}
	return str.join(', ');
}

export function formatSkillRequirements(reqs: Record<string, number>, emojis = true) {
	let arr = [];
	for (const [name, num] of objectEntries(reqs)) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		arr.push(`${emojis ? ` ${skillEmoji[name]} ` : ''}**${num}** ${toTitleCase(name)}`);
	}
	return arr.join(', ');
}

export function formatItemBoosts(items: ItemBank[]) {
	const str = [];
	for (const itemSet of items) {
		const itemEntries = Object.entries(itemSet);
		const multiple = itemEntries.length > 1;
		const bonusStr = [];

		for (const [itemID, boostAmount] of itemEntries) {
			bonusStr.push(`${boostAmount}% for ${itemNameFromID(parseInt(itemID))}`);
		}

		if (multiple) {
			str.push(`(${bonusStr.join(' OR ')})`);
		} else {
			str.push(bonusStr.join(''));
		}
	}
	return str.join(', ');
}

export function filterItemTupleByQuery(query: string, items: ItemTuple[]) {
	const filtered: ItemTuple[] = [];

	for (const item of items) {
		if (cleanString(Items.get(item[0])!.name).includes(cleanString(query))) {
			filtered.push(item);
		}
	}

	return filtered;
}

/**
 * Given a list of items, and a bank, it will return a new bank with all items not
 * in the filter removed from the bank.
 * @param itemFilter The array of item IDs to use as the filter.
 * @param bank The bank to filter items from.
 */
export function filterBankFromArrayOfItems(itemFilter: number[], bank: ItemBank): ItemBank {
	const returnBank: ItemBank = {};
	const bankKeys = Object.keys(bank);

	// If there are no items in the filter or bank, just return an empty bank.
	if (itemFilter.length === 0 || bankKeys.length === 0) return returnBank;

	// For every item in the filter, if its in the bank, add it to the return bank.
	for (const itemID of itemFilter) {
		if (bank[itemID]) returnBank[itemID] = bank[itemID];
	}

	return returnBank;
}

export function updateBankSetting(
	client: KlasaClient,
	setting: string,
	bankToAdd: Bank | ItemBank
) {
	const current = new Bank(client.settings.get(setting) as ItemBank);
	const newBank = current.add(bankToAdd);
	return client.settings.update(setting, newBank.bank);
}

export function removeFromArr<T>(array: T[], item: T) {
	return array.filter(i => i !== item);
}

const masterFarmerOutfit = resolveItems([
	'Master farmer hat',
	'Master farmer jacket',
	'Master farmer pants',
	'Master farmer gloves',
	'Master farmer boots'
]);

export function userHasMasterFarmerOutfit(user: KlasaUser) {
	const allItems = user.allItemsOwned();
	for (const item of masterFarmerOutfit) {
		if (!allItems.has(item)) return false;
	}
	return true;
}

export function updateGPTrackSetting(client: KlasaClient, setting: string, amount: number) {
	const current = client.settings.get(setting) as number;
	const newValue = current + amount;
	return client.settings.update(setting, newValue);
}

export function textEffect(str: string, effect: 'none' | 'strikethrough') {
	let wrap = '';

	if (effect === 'strikethrough') {
		wrap = '~~';
	}
	return `${wrap}${str.replace(/~/g, '')}${wrap}`;
}
