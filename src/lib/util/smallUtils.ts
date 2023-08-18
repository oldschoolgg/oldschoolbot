import { exec } from 'node:child_process';

import { miniID, toTitleCase } from '@oldschoolgg/toolkit';
import type { Prisma } from '@prisma/client';
import { ButtonBuilder, ButtonStyle, time } from 'discord.js';
import { objectEntries, Time } from 'e';
import { Bank, Items } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import { MersenneTwister19937, shuffle } from 'random-js';

import { ClueTiers } from '../clues/clueTiers';
import { PerkTier, projectiles } from '../constants';
import { skillEmoji } from '../data/emojis';
import type { Gear } from '../structures/Gear';
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

export function tailFile(fileName: string, numLines: number): Promise<string> {
	return new Promise((resolve, reject) => {
		exec(`tail -n ${numLines} ${fileName}`, (error, stdout) => {
			if (error) {
				reject(error);
			} else {
				resolve(stdout);
			}
		});
	});
}

export function checkRangeGearWeapon(gear: Gear) {
	const weapon = gear.equippedWeapon();
	if (!weapon) return 'You have no weapon equipped.';
	const { ammo } = gear;
	if (!ammo) return 'You have no ammo equipped.';

	const projectileCategory = objectEntries(projectiles).find(i => i[1].weapons.includes(weapon.id));
	if (!projectileCategory) return 'You have an invalid range weapon.';
	if (!projectileCategory[1].items.includes(ammo.item)) {
		return `You have invalid ammo for your equipped weapon. For ${
			projectileCategory[0]
		}-based weapons, you can use: ${projectileCategory[1].items.map(itemNameFromID).join(', ')}.`;
	}

	return {
		weapon,
		ammo
	};
}

export function getToaKCs(toaRaidLevelsBank: Prisma.JsonValue) {
	let entryKC = 0;
	let normalKC = 0;
	let expertKC = 0;
	for (const [levelStr, qty] of Object.entries(toaRaidLevelsBank as ItemBank)) {
		const level = Number(levelStr);
		if (level >= 300) {
			expertKC += qty;
			continue;
		}
		if (level >= 150) {
			normalKC += qty;
			continue;
		}
		entryKC += qty;
	}
	return { entryKC, normalKC, expertKC, totalKC: entryKC + normalKC + expertKC };
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
