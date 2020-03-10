import { Image } from 'canvas';
import Items from 'oldschooljs/dist/structures/Items';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import { ScheduledTask, KlasaUser, util } from 'klasa';
import { Util, Client } from 'discord.js';

import { Tasks, Emoji, Events } from './constants';
import killableMonsters from './killableMonsters';
import { UserSettings } from './UserSettings';
import { Bank } from './types';

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

export function canvasImageFromBuffer(imageBuffer: Buffer): Promise<Image> {
	return new Promise((resolve, reject) => {
		const canvasImage = new Image();

		canvasImage.onload = () => resolve(canvasImage);
		canvasImage.onerror = () => reject(new Error('Failed to load image.'));
		canvasImage.src = imageBuffer;
	});
}

export function removeItemFromBank(bank: Bank, itemID: number, amountToRemove = 1) {
	const newBank = { ...bank };
	const currentValue = bank[itemID];

	// If they don't have this item in the bank, just return it.
	if (typeof currentValue === 'undefined') return bank;

	// If they will have 0 or less of this item afterwards, delete it entirely.
	if (currentValue <= amountToRemove) {
		delete newBank[itemID];
	}

	newBank[itemID] = currentValue - amountToRemove;

	return newBank;
}

export function addItemToBank(bank: Bank, itemID: number, amountToAdd = 1) {
	const newBank = { ...bank };

	if (newBank[itemID]) newBank[itemID] += amountToAdd;
	else newBank[itemID] = amountToAdd;

	return newBank;
}

export function addBankToBank(fromBank: Bank, toBank: Bank) {
	let newBank = { ...toBank };

	for (const [itemID, quantity] of Object.entries(fromBank)) {
		newBank = addItemToBank(newBank, parseInt(itemID), quantity);
	}

	return newBank;
}

export function addArrayOfItemsToBank(bank: Bank, items: number[]) {
	let newBank = { ...bank };

	for (const item of items) {
		newBank = addItemToBank(newBank, item);
	}

	return newBank;
}

export function randomItemFromArray<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

export function chunkObject(obj: { [key: string]: any }, limit: number) {
	const chunkedObjects = [];
	for (const chunk of util.chunk(Object.entries(obj), limit)) {
		chunkedObjects.push(Object.fromEntries(chunk));
	}
	return chunkedObjects;
}

export function toTitleCase(str: string) {
	const splitStr = str.toLowerCase().split(' ');
	for (let i = 0; i < splitStr.length; i++) {
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	return splitStr.join(' ');
}

export function cleanString(str: string) {
	return str.replace(/[^0-9a-zA-Z]/gi, '').toUpperCase();
}

// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
export function noOp(any: any): any {}

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
	return Object.entries(time)
		.filter(val => val[1] !== 0)
		.map(([key, val]) => `${val} ${key}${val === 1 ? '' : 's'}`)
		.join(', ');
}

export function activityTaskFilter(task: ScheduledTask) {
	return ([
		Tasks.ClueTicker,
		Tasks.MonsterKillingTicker,
		Tasks.SkillingTicker
	] as string[]).includes(task.taskName);
}

export function getMinionName(user: KlasaUser) {
	const name = user.settings.get(UserSettings.Minion.Name);
	return name
		? `${Emoji.Minion} **${Util.escapeMarkdown(name)}**`
		: `${Emoji.Minion} Your minion`;
}

export function inlineCodeblock(input: string) {
	return `\`${input.replace(/ /g, '\u00A0').replace(/`/g, '`\u200B')}\``;
}

const happyEmojis = [
	Emoji.Happy,
	Emoji.PeepoNoob,
	Emoji.PeepoOSBot,
	Emoji.PeepoSlayer,
	Emoji.PeepoRanger,
	Emoji.FancyLoveheart
];

export const randomHappyEmoji = () => randomItemFromArray(happyEmojis);

export function findMonster(str: string) {
	return killableMonsters.find(
		mon => stringMatches(mon.name, str) || mon.aliases.some(alias => stringMatches(alias, str))
	);
}

export function saveCtx(ctx: any) {
	const props = [
		'strokeStyle',
		'fillStyle',
		'globalAlpha',
		'lineWidth',
		'lineCap',
		'lineJoin',
		'miterLimit',
		'lineDashOffset',
		'shadowOffsetX',
		'shadowOffsetY',
		'shadowBlur',
		'shadowColor',
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

export function roll(max: number) {
	return Math.floor(Math.random() * max + 1) === 1;
}

export function removeDuplicatesFromArray(arr: unknown[]) {
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

export function rand(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min);
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
