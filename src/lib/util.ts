import { gzip } from 'node:zlib';

import { stripEmojis } from '@oldschoolgg/toolkit';
import { Stopwatch } from '@sapphire/stopwatch';
import { createHash } from 'crypto';
import {
	BaseMessageOptions,
	ButtonBuilder,
	ButtonInteraction,
	CacheType,
	Collection,
	CollectorFilter,
	ComponentType,
	escapeMarkdown,
	Guild,
	InteractionReplyOptions,
	InteractionType,
	Message,
	MessageEditOptions,
	SelectMenuInteraction,
	TextChannel
} from 'discord.js';
import { chunk, notEmpty, objectEntries, Time } from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import murmurHash from 'murmurhash';
import { Bank } from 'oldschooljs';
import { bool, integer, nodeCrypto, real } from 'random-js';

import { ADMIN_IDS, OWNER_IDS, SupportServer } from '../config';
import { ClueTiers } from './clues/clueTiers';
import { badgesCache, BitField, usernameCache } from './constants';
import { UserStatsDataNeededForCL } from './data/Collections';
import { DefenceGearStat, GearSetupType, GearSetupTypes, GearStat, OffenceGearStat } from './gear/types';
import type { Consumable } from './minions/types';
import { MUserClass } from './MUser';
import { PaginatedMessage } from './PaginatedMessage';
import type { POHBoosts } from './poh';
import { SkillsEnum } from './skilling/types';
import { MUserStats } from './structures/MUserStats';
import type { ItemBank, Skills } from './types';
import type {
	GroupMonsterActivityTaskOptions,
	NexTaskOptions,
	RaidsOptions,
	TheatreOfBloodTaskOptions
} from './types/minions';
import getOSItem, { getItem } from './util/getOSItem';
import itemID from './util/itemID';

export { cleanString, stringMatches, stripEmojis } from '@oldschoolgg/toolkit';
export * from 'oldschooljs/dist/util/index';

const zeroWidthSpace = '\u200b';
// @ts-ignore ignore
// eslint-disable-next-line no-extend-native, func-names
BigInt.prototype.toJSON = function () {
	return this.toString();
};
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
				default:
					return `<${type}${zeroWidthSpace}${id}>`;
			}
		});
}

export function isWeekend() {
	const currentDate = new Date(Date.now() - Time.Hour * 6);
	return [6, 0].includes(currentDate.getDay());
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

export function cryptoRand(min: number, max: number) {
	return integer(min, max)(nodeCrypto);
}

export function randFloat(min: number, max: number) {
	return real(min, max)(nodeCrypto);
}

export function percentChance(percent: number) {
	return bool(percent / 100)(nodeCrypto);
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

function gaussianRand(rolls: number = 3) {
	let rand = 0;
	for (let i = 0; i < rolls; i += 1) {
		rand += Math.random();
	}
	return rand / rolls;
}

export function gaussianRandom(min: number, max: number, rolls?: number) {
	return Math.floor(min + gaussianRand(rolls) * (max - min + 1));
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

export type PaginatedMessagePage = MessageEditOptions;

export async function makePaginatedMessage(channel: TextChannel, pages: PaginatedMessagePage[], target?: string) {
	const m = new PaginatedMessage({ pages, channel });
	return m.run(target ? [target] : undefined);
}

export function convertPercentChance(percent: number) {
	return (1 / (percent / 100)).toFixed(1);
}

export function murMurHashChance(input: string, percent: number) {
	const hash = murmurHash.v3(input) % 1e4;
	return hash < percent * 100;
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

export function convertBankToPerHourStats(bank: Bank, time: number) {
	let result = [];
	for (const [item, qty] of bank.items()) {
		result.push(`${(qty / (time / Time.Hour)).toFixed(1)}/hr ${item.name}`);
	}
	return result;
}

export function removeMarkdownEmojis(str: string) {
	return escapeMarkdown(stripEmojis(str));
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
	const newResponse: InteractionReplyOptions = { content: '', files: [], components: [] };
	for (const res of [first, second]) {
		if (res.content) newResponse.content += `${res.content} `;
		if (res.files) newResponse.files = [...newResponse.files!, ...res.files];
		if (res.components) newResponse.components = res.components;
	}
	return newResponse;
}

export async function asyncGzip(buffer: Buffer) {
	return new Promise<Buffer>((resolve, reject) => {
		gzip(buffer, {}, (error, gzipped) => {
			if (error) {
				reject(error);
			}
			resolve(gzipped);
		});
	});
}

export function skillingPetDropRate(
	user: MUserClass,
	skill: SkillsEnum,
	baseDropRate: number
): { petDropRate: number } {
	const twoHundredMillXP = user.skillsAsXP[skill] >= 200_000_000;
	const skillLevel = user.skillsAsLevels[skill];
	const petRateDivisor = twoHundredMillXP ? 15 : 1;
	const dropRate = Math.floor((baseDropRate - skillLevel * 25) / petRateDivisor);
	return { petDropRate: dropRate };
}

export function getBadges(user: MUser | string | bigint) {
	if (typeof user === 'string' || typeof user === 'bigint') {
		return badgesCache.get(user.toString()) ?? '';
	}
	return user.badgeString;
}

export function getUsername(id: string | bigint, withBadges: boolean = true) {
	let username = usernameCache.get(id.toString()) ?? 'Unknown';
	if (withBadges) username = `${getBadges(id)} ${username}`;
	return username;
}

export function makeComponents(components: ButtonBuilder[]): InteractionReplyOptions['components'] {
	return chunk(components, 5).map(i => ({ components: i, type: ComponentType.ActionRow }));
}

type test = CollectorFilter<
	[
		ButtonInteraction<CacheType> | SelectMenuInteraction<CacheType>,
		Collection<string, ButtonInteraction<CacheType> | SelectMenuInteraction>
	]
>;
export function awaitMessageComponentInteraction({
	message,
	filter,
	time
}: {
	time: number;
	message: Message;
	filter: test;
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

export async function runTimedLoggedFn(name: string, fn: () => Promise<unknown>) {
	debugLog(`Starting ${name}...`);
	const stopwatch = new Stopwatch();
	stopwatch.start();
	await fn();
	stopwatch.stop();
	debugLog(`Finished ${name} in ${stopwatch.toString()}`);
}

export function getInteractionTypeName(type: InteractionType) {
	return {
		[InteractionType.Ping]: 'Ping',
		[InteractionType.ApplicationCommand]: 'ApplicationCommand',
		[InteractionType.MessageComponent]: 'MessageComponent',
		[InteractionType.ApplicationCommandAutocomplete]: 'ApplicationCommandAutocomplete',
		[InteractionType.ModalSubmit]: 'ModalSubmit'
	}[type];
}

export function isModOrAdmin(user: MUser) {
	return [...OWNER_IDS, ...ADMIN_IDS].includes(user.id) || user.bitfield.includes(BitField.isModerator);
}

export async function calcClueScores(user: MUser) {
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
				opened: openableBank.amount(tier.id)
			};
		})
		.filter(notEmpty);
}

export async function fetchStatsForCL(user: MUser): Promise<UserStatsDataNeededForCL> {
	const stats = await MUserStats.fromID(user.id);
	const { userStats } = stats;
	return {
		sacrificedBank: new Bank(userStats.sacrificed_bank as ItemBank),
		titheFarmsCompleted: userStats.tithe_farms_completed,
		lapsScores: userStats.laps_scores as ItemBank,
		openableScores: new Bank(userStats.openable_scores as ItemBank),
		kcBank: userStats.monster_scores as ItemBank,
		highGambles: userStats.high_gambles,
		gotrRiftSearches: userStats.gotr_rift_searches,
		stats
	};
}

export function md5sum(str: string) {
	return createHash('md5').update(str).digest('hex');
}

export { assert } from './util/logError';
export * from './util/smallUtils';
export { channelIsSendable } from '@oldschoolgg/toolkit';
