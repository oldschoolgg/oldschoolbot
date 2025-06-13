import {
	type CommandResponse,
	calcPerHour,
	cleanUsername,
	formatDuration,
	isWeekend,
	makeComponents,
	stringMatches
} from '@oldschoolgg/toolkit/util';
import {
	type BaseMessageOptions,
	type ButtonInteraction,
	type CacheType,
	type Collection,
	type CollectorFilter,
	type Guild,
	type InteractionReplyOptions,
	type Message,
	type MessageEditOptions,
	type SelectMenuInteraction,
	type TextChannel,
	userMention
} from 'discord.js';
import type { ComponentType } from 'discord.js';
import { Time, noOp, objectEntries } from 'e';
import { bool, integer, nativeMath, nodeCrypto, real } from 'random-js';

import { Stopwatch } from '@oldschoolgg/toolkit/structures';
import type { Prisma, User } from '@prisma/client';
import type { MUserClass } from './MUser';
import { PaginatedMessage } from './PaginatedMessage';
import { usernameWithBadgesCache } from './cache';
import { BitField, MAX_XP, globalConfig } from './constants';
import type { Consumable } from './minions/types';
import { SkillsEnum } from './skilling/types';
import type { GearBank } from './structures/GearBank';
import type { Skills } from './types';
import type { GroupMonsterActivityTaskOptions } from './types/minions';
import { makeBadgeString } from './util/makeBadgeString';
import { sendToChannelID } from './util/webhook.js';

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

export function isGroupActivity(data: any): data is GroupMonsterActivityTaskOptions {
	return 'users' in data;
}

export function getSupportGuild(): Guild | null {
	if (!globalClient || Object.keys(globalClient).length === 0) return null;
	const guild = globalClient.guilds.cache.get(globalConfig.supportServerID);
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
			str.push(formatList(subStr));
		} else {
			str.push(subStr.join(''));
		}
	}

	if (consumables.length > 1) {
		return str.join(' OR ');
	}

	return str.join('');
}

export type PaginatedMessagePage = MessageEditOptions | (() => Promise<MessageEditOptions>);

export async function makePaginatedMessage(channel: TextChannel, pages: PaginatedMessagePage[], target?: string) {
	const m = new PaginatedMessage({ pages, channel });
	return m.run(target ? [target] : undefined);
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

export function createUsernameWithBadges(user: Pick<User, 'username' | 'badges' | 'minion_ironman'>): string {
	if (!user.username) return 'Unknown';
	const badges = makeBadgeString(user.badges, user.minion_ironman);
	return `${badges ? `${badges} ` : ''}${user.username}`;
}

export async function getUsername(_id: string | bigint): Promise<string> {
	const id = _id.toString();
	const cached = usernameWithBadgesCache.get(id);
	if (cached) return cached;
	let user = await prisma.user.upsert({
		where: {
			id
		},
		select: {
			username: true,
			badges: true,
			minion_ironman: true
		},
		create: {
			id
		},
		update: {}
	});

	// If no username available, fetch it
	if (!user?.username) {
		const djsUser = await globalClient.users.fetch(id).catch(() => null);
		if (djsUser) {
			user = await prisma.user.update({
				where: {
					id
				},
				data: {
					username: cleanUsername(djsUser.username)
				}
			});
		}
		// Now the user has a username, and we can continue to create the username with badges.
	}

	const newValue = createUsernameWithBadges(user);
	usernameWithBadgesCache.set(id, newValue);
	await prisma.user.update({
		where: {
			id
		},
		data: {
			username_with_badges: newValue
		}
	});
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
	return globalConfig.adminUserIDs.includes(user.id) || user.bitfield.includes(BitField.isModerator);
}

export { assert } from './util/logError';
export * from './util/smallUtils';
export { channelIsSendable } from '@oldschoolgg/toolkit/util';

export type JsonKeys<T> = {
	[K in keyof T]: T[K] extends Prisma.JsonValue ? K : never;
}[keyof T];

export function formatList(_itemList: (string | undefined | null)[], end?: string) {
	const itemList = _itemList.filter(i => i !== undefined && i !== null) as string[];
	if (itemList.length < 2) return itemList.join(', ');
	const lastItem = itemList.pop();
	return `${itemList.join(', ')} ${end ? end : 'and'} ${lastItem}`;
}

export async function adminPingLog(message: string) {
	if (!globalConfig.isProduction) {
		console.log(message);
		return;
	}

	await sendToChannelID(globalConfig.moderatorLogsChannels, {
		content: `${message} ${globalConfig.adminUserIDs.map(i => userMention(i)).join(', ')}`,
		allowedMentions: { users: globalConfig.adminUserIDs }
	}).catch(noOp);
}
