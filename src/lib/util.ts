import { Image } from 'canvas';
import { Bank } from './types';
import { util } from 'klasa';
import { Items } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import { ScheduledTask } from 'klasa';
import { Tasks, Emoji } from './constants';
import { Util } from 'discord.js';
import { KlasaUser } from 'klasa';
import killableMonsters from './killableMonsters';

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
	} else {
		return quantity.toString();
	}
}

export function canvasImageFromBuffer(imageBuffer: Buffer): Promise<Image> {
	return new Promise((resolve, reject) => {
		const canvasImage = new Image();

		canvasImage.onload = () => resolve(canvasImage);
		canvasImage.onerror = () => reject(new Error('Failed to load image.'));
		canvasImage.src = imageBuffer;
	});
}

export function removeItemFromBank(bank: Bank, itemID: number, amountToRemove: number = 1) {
	let newBank = { ...bank };
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

export function addItemToBank(bank: Bank, itemID: number, amountToAdd: number = 1) {
	let newBank = { ...bank };

	if (!newBank[itemID]) newBank[itemID] = amountToAdd;
	else newBank[itemID] += amountToAdd;

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
	let splitStr = str.toLowerCase().split(' ');
	for (let i = 0; i < splitStr.length; i++) {
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	return splitStr.join(' ');
}

export function cleanString(str: string) {
	return str.replace(/[^0-9a-zA-Z]/gi, '').toUpperCase();
}

export function noOp(any: any): any {}

export function stringMatches(str: string, str2: string) {
	return cleanString(str) === cleanString(str2);
}

export function bankToString(bank: ItemBank, chunkSize?: number) {
	let display = [];
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
		.map(([key, val]) => `${val} ${key}${val !== 1 ? 's' : ''}`)
		.join(', ');
}

export function activityTaskFilter(task: ScheduledTask) {
	return ([Tasks.MonsterActivity, Tasks.ClueActivity] as string[]).includes(task.taskName);
}

export function getMinionName(user: KlasaUser) {
	const name = user.settings.get('minion.name');
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
	let props = [
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
	let state: { [key: string]: any } = {};
	for (const prop of props) {
		state[prop] = ctx[prop];
	}
	return state;
}

export function restoreCtx(ctx: any, state: any) {
	for (const prop in state) {
		ctx[prop] = state[prop];
	}
}

export function isWeekend() {
	const currentDate = new Date();
	return currentDate.getDay() === 6 || currentDate.getDay() === 0;
}
