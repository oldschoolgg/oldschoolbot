import { Image } from 'canvas';
import Items from 'oldschooljs/dist/structures/Items';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import { KlasaClient, ScheduledTask, util } from 'klasa';
import { Client } from 'discord.js';
import { bool, integer, nodeCrypto, real } from 'random-js';
import { Events, Tasks } from './constants';
import { channelIsSendable } from './util/channelIsSendable';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const emojiRegex = require('emoji-regex');

export * from 'oldschooljs/dist/util/index';

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
	return str.replace(/[^0-9a-zA-Z+]/gi, '').toUpperCase();
}

// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
export function noOp(any: any): undefined {
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
	return Object.entries(time)
		.filter(val => val[1] !== 0)
		.map(([key, val]) => `${val} ${key}${val === 1 ? '' : 's'}`)
		.join(', ');
}

export function activityTaskFilter(task: ScheduledTask) {
	return ([
		Tasks.ClueTicker,
		Tasks.MonsterKillingTicker,
		Tasks.SkillingTicker,
		Tasks.MinigameTicker
	] as string[]).includes(task.taskName);
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

export async function queuedMessageSend(client: KlasaClient, channelID: string, str: string) {
	const channel = client.channels.get(channelID);
	if (!channelIsSendable(channel)) return;
	client.queuePromise(() => channel.send(str, { split: true }));
}

const rawEmojiRegex = emojiRegex();

export function stripEmojis(str: string) {
	return str.replace(rawEmojiRegex, '');
}
