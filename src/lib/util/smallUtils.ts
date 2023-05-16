import { miniID, toTitleCase } from '@oldschoolgg/toolkit';
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { objectEntries, Time } from 'e';
import { Bank, Items } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import { MersenneTwister19937, shuffle } from 'random-js';

import { ClueTiers } from '../clues/clueTiers';
import { PerkTier } from '../constants';
import { skillEmoji } from '../data/emojis';
import type { ArrayItemsResolved, Skills } from '../types';
import getOSItem from './getOSItem';

export function itemNameFromID(itemID: number | string) {
	return Items.get(itemID)?.name;
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

export function calcPerHour(value: number, duration: number) {
	return (value / (duration / Time.Minute)) * 60;
}

export function formatDuration(ms: number, short = false) {
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
	let nums = Object.entries(short ? shortTime : time).filter(val => val[1] !== 0);
	if (nums.length === 0) return '1 second';
	return nums
		.map(([key, val]) => `${val}${short ? '' : ' '}${key}${val === 1 || short ? '' : 's'}`)
		.join(short ? '' : ', ');
}

export function formatSkillRequirements(reqs: Record<string, number>, emojis = true) {
	let arr = [];
	for (const [name, num] of objectEntries(reqs)) {
		arr.push(`${emojis ? ` ${(skillEmoji as any)[name]} ` : ''}**${num}** ${toTitleCase(name)}`);
	}
	return arr.join(', ');
}

export function hasSkillReqs(user: MUser, reqs: Skills): [boolean, string | null] {
	const hasReqs = user.hasSkillReqs(reqs);
	if (!hasReqs) {
		return [false, formatSkillRequirements(reqs)];
	}
	return [true, null];
}

/**
 * Scale percentage exponentially
 *
 * @param decay Between 0.01 and 0.05; bigger means more penalty.
 * @param percent The percent to scale
 * @returns percent
 */
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

export function shuffleRandom<T>(input: number, arr: readonly T[]): T[] {
	const engine = MersenneTwister19937.seed(input);
	return shuffle(engine, [...arr]);
}

export function averageBank(bank: Bank, kc: number) {
	let newBank = new Bank();
	for (const [item, qty] of bank.items()) {
		newBank.add(item.id, Math.floor(qty / kc));
	}
	return newBank;
}

export function calcBabyYagaHouseDroprate(xpBeingReceived: number, cl: Bank) {
	let rate = 1 / (((xpBeingReceived / 30) * 30) / 50_000_000);
	let amountInCl = cl.amount('Baby yaga house');
	if (amountInCl > 1) rate *= amountInCl;
	return Math.floor(rate);
}

const shortItemNames = new Map([
	[getOSItem('Saradomin brew(4)'), 'Brew'],
	[getOSItem('Super restore(4)'), 'Restore'],
	[getOSItem('Super combat potion(4)'), 'Super combat'],
	[getOSItem('Sanfew serum(4)'), 'Sanfew'],
	[getOSItem('Ranging potion(4)'), 'Range pot']
]);

export function bankToStrShortNames(bank: Bank) {
	const str = [];
	for (const [item, qty] of bank.items()) {
		const shortName = shortItemNames.get(item);
		str.push(`${qty}x ${shortName ?? item.name}${qty > 1 ? 's' : ''}`);
	}
	return str.join(', ');
}

export function readableStatName(slot: string) {
	return toTitleCase(slot.replace('_', ' '));
}

export function makeEasierFarmingContractButton() {
	return new ButtonBuilder()
		.setCustomId('FARMING_CONTRACT_EASIER')
		.setLabel('Ask for easier Contract')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('977410792754413668');
}

export function buildClueButtons(loot: Bank | null, perkTier: number) {
	const components: ButtonBuilder[] = [];
	if (loot && perkTier > PerkTier.One) {
		const clueReceived = ClueTiers.filter(tier => loot.amount(tier.scrollID) > 0);
		components.push(
			...clueReceived.map(clue =>
				new ButtonBuilder()
					.setCustomId(`DO_${clue.name.toUpperCase()}_CLUE`)
					.setLabel(`Do ${clue.name} Clue`)
					.setStyle(ButtonStyle.Secondary)
					.setEmoji('365003979840552960')
			)
		);
	}
	return components;
}

export function makeAutoFarmButton() {
	return new ButtonBuilder()
		.setCustomId('AUTO_FARM')
		.setLabel('Auto Farm')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('630911040355565599');
}

export const SQL_sumOfAllCLItems = (clItems: number[]) =>
	`NULLIF(${clItems.map(i => `COALESCE(("collectionLogBank"->>'${i}')::int, 0)`).join(' + ')}, 0)`;

export const generateGrandExchangeID = () => miniID(5).toLowerCase();
