import { Stopwatch, stripEmojis } from '@oldschoolgg/toolkit';
import type { CommandResponse } from '@oldschoolgg/toolkit';
import {
	type BaseMessageOptions,
	type ButtonInteraction,
	type CacheType,
	type Collection,
	type CollectorFilter,
	type InteractionReplyOptions,
	type Message,
	type MessageEditOptions,
	type SelectMenuInteraction,
	type TextChannel,
	bold,
	escapeMarkdown
} from 'discord.js';
import type { ComponentType } from 'discord.js';
import { Time, calcWhatPercent, notEmpty, objectEntries, randArrItem, randInt, shuffleArr, sumArr } from 'e';
import { Bank, Items, Monsters } from 'oldschooljs';
import { bool, integer, nativeMath, nodeCrypto, real } from 'random-js';

import type { Prisma } from '@prisma/client';
import { LRUCache } from 'lru-cache';
import type { Item } from 'oldschooljs/dist/meta/types';
import type Monster from 'oldschooljs/dist/structures/Monster';
import { convertLVLtoXP } from 'oldschooljs/dist/util/util';
import type { MUserClass } from './MUser';
import { PaginatedMessage } from './PaginatedMessage';
import { ClueTiers } from './clues/clueTiers';
import { BitField, ONE_TRILLION, type ProjectileType, globalConfig, projectiles } from './constants';
import { doaCL } from './data/CollectionsExport';
import { getSimilarItems } from './data/similarItems';
import type { DefenceGearStat, GearSetupType, OffenceGearStat } from './gear/types';
import { GearSetupTypes, GearStat } from './gear/types';
import type { Consumable } from './minions/types';
import type { POHBoosts } from './poh';
import { SkillsEnum } from './skilling/types';
import type { Gear } from './structures/Gear';
import type { ItemBank, Skills } from './types';
import type {
	GroupMonsterActivityTaskOptions,
	NexTaskOptions,
	RaidsOptions,
	TOAOptions,
	TheatreOfBloodTaskOptions
} from './types/minions';
import getOSItem, { getItem } from './util/getOSItem';
import itemID from './util/itemID';
import { makeBadgeString } from './util/makeBadgeString';
import resolveItems from './util/resolveItems';

export * from '@oldschoolgg/toolkit';
export * from 'oldschooljs/dist/util/index';

// @ts-ignore ignore
BigInt.prototype.toJSON = function () {
	return this.toString();
};

export function inlineCodeblock(input: string) {
	return `\`${input.replace(/ /g, '\u00A0').replace(/`/g, '`\u200B')}\``;
}

export function isWeekend() {
	const currentDate = new Date(Date.now() - Time.Hour * 6);
	return [6, 0].includes(currentDate.getDay());
}

export function convertXPtoLVL(xp: number, cap = 120) {
	let points = 0;

	for (let lvl = 1; lvl <= cap; lvl++) {
		points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));

		if (Math.floor(points / 4) >= xp + 1) {
			return lvl;
		}
	}

	return cap;
}

const randEngine = process.env.TEST ? nativeMath : nodeCrypto;

export function cryptoRand(min: number, max: number) {
	return integer(min, max)(randEngine);
}

export function randFloat(min: number, max: number) {
	return real(min, max)(randEngine);
}

export function percentChance(percent: number) {
	return bool(percent / 100)(randEngine);
}

export function roll(max: number) {
	return cryptoRand(1, max) === 1;
}

export const anglerBoosts = [
	[itemID('Angler hat'), 0.4],
	[itemID('Angler top'), 0.8],
	[itemID('Angler waders'), 0.6],
	[itemID('Angler boots'), 0.2]
];

export function isValidGearSetup(str: string): str is GearSetupType {
	return GearSetupTypes.includes(str as any);
}

export function isGroupActivity(data: any): data is GroupMonsterActivityTaskOptions {
	return 'users' in data;
}

export function isRaidsActivity(data: any): data is RaidsOptions {
	return 'challengeMode' in data;
}

export function isTOBOrTOAActivity(data: any): data is TheatreOfBloodTaskOptions {
	return 'wipedRoom' in data;
}

export function isNexActivity(data: any): data is NexTaskOptions {
	return 'wipedKill' in data && 'userDetails' in data && 'leader' in data;
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
export function calcTotalLevel(skills: Skills) {
	return sumArr(Object.values(skills));
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

export function formatItemCosts(consumable: Consumable, timeToFinish: number) {
	const str = [];

	const consumables = [consumable];

	if (consumable.alternativeConsumables) {
		for (const c of consumable.alternativeConsumables) {
			consumables.push(c);
		}
	}

	for (const c of consumables) {
		const itemEntries = c.itemCost.items();
		const multiple = itemEntries.length > 1;
		const subStr = [];

		let multiply = 1;
		if (c.qtyPerKill) {
			multiply = c.qtyPerKill;
		} else if (c.qtyPerMinute) {
			multiply = c.qtyPerMinute * (timeToFinish / Time.Minute);
		}

		for (const [item, quantity] of itemEntries) {
			subStr.push(`${Number((quantity * multiply).toFixed(3))}x ${item.name}`);
		}

		if (multiple) {
			str.push(subStr.join(', '));
		} else {
			str.push(subStr.join(''));
		}
	}

	if (consumables.length > 1) {
		return `(${str.join(' OR ')})`;
	}

	return str.join('');
}

export function formatPohBoosts(boosts: POHBoosts) {
	const bonusStr = [];
	const slotStr = [];

	for (const [slot, objBoosts] of objectEntries(boosts)) {
		if (objBoosts === undefined) continue;
		for (const [name, boostPercent] of objectEntries(objBoosts)) {
			bonusStr.push(`${boostPercent}% for ${name}`);
		}

		slotStr.push(`${slot.replace(/\b\S/g, t => t.toUpperCase())}: (${bonusStr.join(' or ')})\n`);
	}

	return slotStr.join(', ');
}

export function isValidNickname(str?: string) {
	return Boolean(
		str &&
			typeof str === 'string' &&
			str.length >= 2 &&
			str.length <= 30 &&
			['\n', '`', '@', '<', ':'].every(char => !str.includes(char)) &&
			stripEmojis(str).length === str.length
	);
}

export type PaginatedMessagePage = MessageEditOptions | (() => Promise<MessageEditOptions>);

export async function makePaginatedMessage(channel: TextChannel, pages: PaginatedMessagePage[], target?: string) {
	const m = new PaginatedMessage({ pages, channel });
	return m.run(target ? [target] : undefined);
}

export function isSuperUntradeable(item: number | Item) {
	const id = typeof item === 'number' ? item : item.id;
	if (id === 5021) return true;
	if (id === itemID('Snowball')) return true;
	const fullItem = Items.get(id);
	if (fullItem?.customItemData?.isSuperUntradeable) {
		return true;
	}
	return id >= 40_000 && id <= 45_000;
}

export function isGEUntradeable(item: number | Item) {
	const fullItem = typeof item === 'number' ? Items.get(item) : item;
	if (!fullItem || !fullItem.customItemData || !fullItem.customItemData.superTradeableButTradeableOnGE) {
		return isSuperUntradeable(item);
	}
	if (fullItem.customItemData.isSuperUntradeable && fullItem.customItemData.superTradeableButTradeableOnGE) {
		return false;
	}
	return isSuperUntradeable(item);
}

export function birdhouseLimit(user: MUser) {
	let base = 4;
	if (user.bitfield.includes(BitField.HasScrollOfTheHunt)) base += 4;
	if (user.hasEquippedOrInBank('Hunter master cape')) base += 4;
	return base;
}

export function determineProjectileTypeFromGear(gear: Gear): ProjectileType | null {
	if (resolveItems(['Twisted bow', 'Hellfire bow', 'Zaryte bow']).some(i => gear.hasEquipped(i))) {
		return 'arrow';
	} else if (
		resolveItems(['Chaotic crossbow', 'Armadyl crossbow', 'Dragon crossbow']).some(i => gear.hasEquipped(i))
	) {
		return 'bolt';
	}
	return null;
}

export function getMonster(str: string): Monster {
	const mon = Monsters.find(_m => _m.name === str);

	if (!mon) {
		throw new Error(`Invalid monster name given: ${str}`);
	}
	return mon;
}

export function calcDropRatesFromBank(bank: Bank, iterations: number, uniques: number[]) {
	const result = [];
	let uniquesReceived = 0;
	for (const [item, qty] of bank.items().sort((a, b) => a[1] - b[1])) {
		if (uniques.includes(item.id)) {
			uniquesReceived += qty;
		}
		const rate = Math.round(iterations / qty);
		if (rate < 2) continue;
		let { name } = item;
		if (uniques.includes(item.id)) name = bold(name);
		result.push(`${qty}x ${name} (1 in ${rate})`);
	}
	result.push(
		`\n**${uniquesReceived}x Uniques (1 in ${Math.round(iterations / uniquesReceived)} which is ${calcWhatPercent(
			uniquesReceived,
			iterations
		)}%)**`
	);
	return result.join(', ');
}

export function convertPercentChance(percent: number) {
	return (1 / (percent / 100)).toFixed(1);
}

export function convertAttackStyleToGearSetup(style: OffenceGearStat | DefenceGearStat) {
	let setup: GearSetupType = 'melee';

	switch (style) {
		case GearStat.AttackMagic:
		case GearStat.DefenceMagic:
			setup = 'mage';
			break;
		case GearStat.AttackRanged:
		case GearStat.DefenceRanged:
			setup = 'range';
			break;
		default:
			break;
	}

	return setup;
}

export function ISODateString(date?: Date) {
	return (date ?? new Date()).toISOString().slice(0, 10);
}

export function convertPvmStylesToGearSetup(attackStyles: SkillsEnum[]) {
	const usedSetups: GearSetupType[] = [];
	if (attackStyles.includes(SkillsEnum.Ranged)) usedSetups.push('range');
	if (attackStyles.includes(SkillsEnum.Magic)) usedSetups.push('mage');
	if (![SkillsEnum.Magic, SkillsEnum.Ranged].some(s => attackStyles.includes(s))) {
		usedSetups.push('melee');
	}
	if (usedSetups.length === 0) usedSetups.push('melee');
	return usedSetups;
}

export function sanitizeBank(bank: Bank) {
	for (const [key, value] of Object.entries(bank.bank)) {
		if (value < 1) {
			delete bank.bank[key];
		}
		// If this bank contains a fractional/float,
		// round it down.
		if (!Number.isInteger(value)) {
			bank.bank[key] = Math.floor(value);
		}

		const item = getItem(key);
		if (!item) {
			delete bank.bank[key];
		}
	}
}

export function validateBankAndThrow(bank: Bank) {
	if (!bank || typeof bank !== 'object') {
		throw new Error('Invalid bank object');
	}
	for (const [key, value] of Object.entries(bank.bank)) {
		const pair = [key, value].join('-');
		if (value < 1) {
			throw new Error(`Less than 1 qty: ${pair}`);
		}

		if (!Number.isInteger(value)) {
			throw new Error(`Non-integer value: ${pair}`);
		}

		const item = getItem(key);
		if (!item) {
			throw new Error(`Invalid item ID: ${pair}`);
		}
	}
}

export function removeMarkdownEmojis(str: string) {
	return escapeMarkdown(stripEmojis(str));
}

export function moidLink(items: number[]) {
	return `https://chisel.weirdgloop.org/moid/item_id.html#${items.join(',')}`;
}

export function isValidSkill(skill: string): skill is SkillsEnum {
	return Object.values(SkillsEnum).includes(skill as SkillsEnum);
}

function normalizeMahojiResponse(one: Awaited<CommandResponse>): BaseMessageOptions {
	if (!one) return {};
	if (typeof one === 'string') return { content: one };
	const response: BaseMessageOptions = {};
	if (one.content) response.content = one.content;
	if (one.files) response.files = one.files;
	if (one.components) response.components = one.components;
	return response;
}

export function roughMergeMahojiResponse(
	one: Awaited<CommandResponse>,
	two: Awaited<CommandResponse>
): InteractionReplyOptions {
	const first = normalizeMahojiResponse(one);
	const second = normalizeMahojiResponse(two);
	const newContent: string[] = [];

	const newResponse: InteractionReplyOptions = { content: '', files: [], components: [] };
	for (const res of [first, second]) {
		if (res.content) newContent.push(res.content);
		if (res.files) newResponse.files = [...newResponse.files!, ...res.files];
		if (res.components) newResponse.components = res.components;
	}
	newResponse.content = newContent.join('\n\n');
	return newResponse;
}

export function generateXPLevelQuestion() {
	const level = randInt(1, 120);
	const xp = randInt(convertLVLtoXP(level), convertLVLtoXP(level + 1) - 1);

	const chanceOfSwitching = randInt(1, 4);

	const answers: string[] = [level.toString()];
	const arr = shuffleArr(['plus', 'minus'] as const);

	while (answers.length < 4) {
		const modifier = randArrItem([1, 1, 2, 2, 3, 4, 5, 5, 6, 7, 7, 8, 9, 10, 10]);
		const action = roll(chanceOfSwitching) ? arr[0] : arr[1];
		let potentialAnswer = action === 'plus' ? level + modifier : level - modifier;
		if (potentialAnswer < 1) potentialAnswer = level + modifier;
		else if (potentialAnswer > 120) potentialAnswer = level - modifier;

		if (answers.includes(potentialAnswer.toString())) continue;
		answers.push(potentialAnswer.toString());
	}

	return {
		question: `What level would you be at with **${xp.toLocaleString()}** XP?`,
		answers,
		explainAnswer: `${xp.toLocaleString()} is level ${level}!`
	};
}

export function skillingPetDropRate(
	userOrSkillXP: MUserClass | number,
	skill: SkillsEnum,
	baseDropRate: number
): { petDropRate: number } {
	const xp = typeof userOrSkillXP === 'number' ? userOrSkillXP : userOrSkillXP.skillsAsXP[skill];
	const twoHundredMillXP = xp >= 5_000_000_000;
	const skillLevel = convertXPtoLVL(xp);
	const petRateDivisor = twoHundredMillXP ? 15 : 1;
	const dropRate = Math.floor((baseDropRate - skillLevel * 25) / petRateDivisor);
	return { petDropRate: dropRate };
}

const usernameWithBadgesCache = new LRUCache<string, string>({ max: 2000 });

export async function getUsername(_id: string | bigint): Promise<string> {
	const id = _id.toString();
	const cached = usernameWithBadgesCache.get(id);
	if (cached) return cached;
	const user = await prisma.user.findFirst({
		where: {
			id
		},
		select: {
			username: true,
			badges: true
		}
	});
	if (!user?.username) return 'Unknown';
	const badges = makeBadgeString(user.badges, true);
	const newValue = `${badges ? `${badges} ` : ''}${user.username}`;
	usernameWithBadgesCache.set(id, newValue);
	return newValue;
}

export function getUsernameSync(_id: string | bigint) {
	return usernameWithBadgesCache.get(_id.toString()) ?? 'Unknown';
}

export function clAdjustedDroprate(
	user: MUser | Bank,
	item: string | number,
	baseRate: number,
	increaseMultiplier: number
) {
	const amountInCL = user instanceof Bank ? user.amount(item) : user.cl.amount(item);
	if (amountInCL === 0) return baseRate;
	let newRate = baseRate;
	for (let i = 0; i < amountInCL; i++) {
		newRate *= increaseMultiplier;
		if (newRate >= ONE_TRILLION) break;
	}
	return Math.floor(newRate);
}

export function awaitMessageComponentInteraction({
	message,
	filter,
	time
}: {
	time: number;
	message: Message;
	filter: CollectorFilter<
		[
			ButtonInteraction<CacheType> | SelectMenuInteraction<CacheType>,
			Collection<string, ButtonInteraction<CacheType> | SelectMenuInteraction>
		]
	>;
}): Promise<SelectMenuInteraction<CacheType> | ButtonInteraction<CacheType>> {
	return new Promise((resolve, reject) => {
		const collector = message.createMessageComponentCollector<ComponentType.Button>({ max: 1, filter, time });
		collector.once('end', (interactions, reason) => {
			const interaction = interactions.first();
			if (interaction) resolve(interaction);
			else reject(new Error(reason));
		});
	});
}

export async function runTimedLoggedFn<T>(name: string, fn: () => Promise<T>, threshholdToLog = 100): Promise<T> {
	const logger = globalConfig.isProduction ? debugLog : console.log;
	const stopwatch = new Stopwatch();
	stopwatch.start();
	const result = await fn();
	stopwatch.stop();
	if (!globalConfig.isProduction || stopwatch.duration > threshholdToLog) {
		logger(`Took ${stopwatch} to do ${name}`);
	}
	return result;
}

export function logWrapFn<T extends (...args: any[]) => Promise<unknown>>(
	name: string,
	fn: T
): (...args: Parameters<T>) => ReturnType<T> {
	return (...args: Parameters<T>): ReturnType<T> => runTimedLoggedFn(name, () => fn(...args)) as ReturnType<T>;
}

export async function calcClueScores(user: MUser) {
	const { actualCluesBank } = await user.calcActualClues();
	const stats = await user.fetchStats({ openable_scores: true });
	const openableBank = new Bank(stats.openable_scores as ItemBank);
	return openableBank
		.items()
		.map(entry => {
			const tier = ClueTiers.find(i => i.id === entry[0].id);
			if (!tier) return;
			return {
				tier,
				casket: getOSItem(tier.id),
				clueScroll: getOSItem(tier.scrollID),
				opened: openableBank.amount(tier.id),
				actualOpened: actualCluesBank.amount(tier.scrollID)
			};
		})
		.filter(notEmpty);
}

export { assert } from './util/logError';
export * from './util/smallUtils';
export { channelIsSendable } from '@oldschoolgg/toolkit';

export function checkRangeGearWeapon(gear: Gear) {
	const weapon = gear.equippedWeapon();
	if (!weapon) return 'You have no weapon equipped.';
	const { ammo } = gear;
	if (!ammo) return 'You have no ammo equipped.';

	const projectileCategory = objectEntries(projectiles).find(i =>
		i[1].weapons.flatMap(w => getSimilarItems(w)).includes(weapon.id)
	);
	if (!projectileCategory) return 'You have an invalid range weapon.';
	if (!projectileCategory[1].items.includes(ammo.item)) {
		return `You have invalid ammo for your equipped weapon. For $
			projectileCategory[0]-based weapons, you can use: $projectileCategory[1].items.map(itemNameFromID).join(', ').`;
	}

	return {
		weapon,
		ammo
	};
}

export function hasUnlockedAtlantis(user: MUser) {
	return doaCL.some(itemID => user.cl.has(itemID));
}

export function normalizeTOAUsers(data: TOAOptions) {
	const _detailedUsers = data.detailedUsers;
	const detailedUsers = (
		(Array.isArray(_detailedUsers[0]) ? _detailedUsers : [_detailedUsers]) as [string, number, number[]][][]
	).map(userArr =>
		userArr.map(user => ({
			id: user[0],
			points: user[1],
			deaths: user[2]
		}))
	);
	return detailedUsers;
}

export function anyoneDiedInTOARaid(data: TOAOptions) {
	return normalizeTOAUsers(data).some(userArr => userArr.some(user => user.deaths.length > 0));
}

export type JsonKeys<T> = {
	[K in keyof T]: T[K] extends Prisma.JsonValue ? K : never;
}[keyof T];
