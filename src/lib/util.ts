import {
	type CommandResponse,
	calcPerHour,
	formatDuration,
	isWeekend,
	makeComponents,
	stringMatches
} from '@oldschoolgg/toolkit/util';
import type {
	BaseMessageOptions,
	ButtonInteraction,
	CacheType,
	Collection,
	CollectorFilter,
	Guild,
	InteractionReplyOptions,
	Message,
	MessageEditOptions,
	SelectMenuInteraction,
	TextChannel
} from 'discord.js';
import type { ComponentType } from 'discord.js';
import { Time, objectEntries } from 'e';
import { bool, integer, nativeMath, nodeCrypto, real } from 'random-js';

import { Stopwatch } from '@oldschoolgg/toolkit/structures';
import type { Prisma } from '@prisma/client';
import { LRUCache } from 'lru-cache';
import { ADMIN_IDS, OWNER_IDS, SupportServer } from '../config';
import type { MUserClass } from './MUser';
import { PaginatedMessage } from './PaginatedMessage';
import { BitField, MAX_XP, globalConfig, projectiles } from './constants';
import { getSimilarItems } from './data/similarItems';
import type { DefenceGearStat, GearSetupType, OffenceGearStat } from './gear/types';
import { GearSetupTypes, GearStat } from './gear/types';
import type { Consumable } from './minions/types';
import type { POHBoosts } from './poh';
import { SkillsEnum } from './skilling/types';
import type { Gear } from './structures/Gear';
import type { GearBank } from './structures/GearBank';
import type { Skills } from './types';
import type {
	GroupMonsterActivityTaskOptions,
	NexTaskOptions,
	RaidsOptions,
	TOAOptions,
	TheatreOfBloodTaskOptions
} from './types/minions';
import { getOSItem } from './util/getOSItem';
import itemID from './util/itemID';
import { makeBadgeString } from './util/makeBadgeString';
import { itemNameFromID } from './util/smallUtils';

export * from 'oldschooljs';

export { stringMatches, calcPerHour, formatDuration, makeComponents, isWeekend };

// @ts-ignore ignore
BigInt.prototype.toJSON = function () {
	return this.toString();
};

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

export function getSupportGuild(): Guild | null {
	if (!globalClient || Object.keys(globalClient).length === 0) return null;
	const guild = globalClient.guilds.cache.get(SupportServer);
	if (!guild) return null;
	return guild;
}

function calcCombatLevel(skills: Skills) {
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
			const levelHas = convertXPtoLVL(xpHas ?? 1);
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
			str.push(joinStrings(subStr));
		} else {
			str.push(subStr.join(''));
		}
	}

	if (consumables.length > 1) {
		return `(${joinStrings(str, 'or')})`;
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

		slotStr.push(`${slot.replace(/\b\S/g, t => t.toUpperCase())}: (${joinStrings(bonusStr, 'or')})\n`);
	}

	return joinStrings(slotStr);
}

export type PaginatedMessagePage = MessageEditOptions | (() => Promise<MessageEditOptions>);

export async function makePaginatedMessage(channel: TextChannel, pages: PaginatedMessagePage[], target?: string) {
	const m = new PaginatedMessage({ pages, channel });
	return m.run(target ? [target] : undefined);
}

export function convertAttackStyleToGearSetup(style: OffenceGearStat | DefenceGearStat) {
	let setup: GearSetupType = 'melee';

	switch (style) {
		case GearStat.AttackMagic:
			setup = 'mage';
			break;
		case GearStat.AttackRanged:
			setup = 'range';
			break;
		default:
			break;
	}

	return setup;
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

export function skillingPetDropRate(
	user: MUserClass | GearBank | number,
	skill: SkillsEnum,
	baseDropRate: number
): { petDropRate: number } {
	const xp = typeof user === 'number' ? user : user.skillsAsXP[skill];
	const twoHundredMillXP = xp >= MAX_XP;
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
			badges: true,
			minion_ironman: true
		}
	});
	if (!user?.username) return 'Unknown';
	const badges = makeBadgeString(user.badges, user.minion_ironman);
	const newValue = `${badges ? `${badges} ` : ''}${user.username}`;
	usernameWithBadgesCache.set(id, newValue);
	return newValue;
}

export function getUsernameSync(_id: string | bigint) {
	return usernameWithBadgesCache.get(_id.toString()) ?? 'Unknown';
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

export function isModOrAdmin(user: MUser) {
	return [...OWNER_IDS, ...ADMIN_IDS].includes(user.id) || user.bitfield.includes(BitField.isModerator);
}

export { assert } from './util/logError';
export * from './util/smallUtils';
export { channelIsSendable } from '@oldschoolgg/toolkit/util';

export function checkRangeGearWeapon(gear: Gear) {
	const weapon = gear.equippedWeapon();
	const { ammo } = gear;
	if (!weapon) return 'You have no weapon equipped.';
	const usingBowfa = getSimilarItems(getOSItem('Bow of faerdhinen (c)').id).includes(weapon.id);
	if (usingBowfa) {
		return {
			weapon,
			ammo
		};
	}
	if (!ammo) return 'You have no ammo equipped.';

	const projectileCategory = objectEntries(projectiles).find(i =>
		i[1].weapons.flatMap(w => getSimilarItems(w)).includes(weapon.id)
	);
	if (!projectileCategory) return 'You have an invalid range weapon.';
	if (!projectileCategory[1].items.includes(ammo.item)) {
		return `You have invalid ammo for your equipped weapon. For ${
			projectileCategory[0]
		}-based weapons, you can use: ${joinStrings(projectileCategory[1].items.map(itemNameFromID), 'or')}.`;
	}

	return {
		weapon,
		ammo
	};
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

export function replaceLast(str: string, pattern: string, replacement: string) {
	const last = str.lastIndexOf(pattern);
	return last !== -1 ? `${str.slice(0, last)}${replacement}${str.slice(last + pattern.length)}` : str;
}

export function joinStrings(itemList: any[], end?: string) {
	if (itemList.length < 2) return itemList.join(', ');
	const lastItem = itemList[itemList.length - 1];
	if (lastItem && (typeof lastItem !== 'string' || !lastItem.toString().includes(','))) {
		return replaceLast(itemList.join(', '), ',', ` ${end ? end : 'and'}`);
	} else {
		// commas in last term will put str in weird place
		return itemList.join(', ');
	}
}
