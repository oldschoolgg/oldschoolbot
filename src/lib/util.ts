import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { exec } from 'child_process';
import crypto from 'crypto';
import { Channel, Client, DMChannel, Guild, MessageButton, MessageOptions, TextChannel, Util } from 'discord.js';
import { calcWhatPercent, objectEntries, randArrItem, randInt, round, shuffleArr, sumArr, Time } from 'e';
import { KlasaClient, KlasaMessage, KlasaUser, SettingsFolder, SettingsUpdateResults } from 'klasa';
import murmurHash from 'murmurhash';
import { Bank, Monsters } from 'oldschooljs';
import { Item, ItemBank } from 'oldschooljs/dist/meta/types';
import Items from 'oldschooljs/dist/structures/Items';
import Monster from 'oldschooljs/dist/structures/Monster';
import { bool, integer, nodeCrypto, real } from 'random-js';
import { promisify } from 'util';

import { production } from '../config';
import {
	BitField,
	CENA_CHARS,
	continuationChars,
	PerkTier,
	ProjectileType,
	skillEmoji,
	SupportServer
} from './constants';
import { DefenceGearStat, GearSetupType, GearSetupTypes, GearStat, OffenceGearStat } from './gear/types';
import { Consumable } from './minions/types';
import { POHBoosts } from './poh';
import { Gear } from './structures/Gear';
import { ArrayItemsResolved, Skills } from './types';
import { GroupMonsterActivityTaskOptions, RaidsOptions, TheatreOfBloodTaskOptions } from './types/minions';
import getUsersPerkTier from './util/getUsersPerkTier';
import itemID from './util/itemID';
import resolveItems from './util/resolveItems';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const emojiRegex = require('emoji-regex');

export { Util } from 'discord.js';
export * from 'oldschooljs/dist/util/index';

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
	if (coins > 9_999_999) {
		return '#00FF80';
	}

	if (coins > 99_999) {
		return '#FFFFFF';
	}

	return '#FFFF00';
}

export function formatItemStackQuantity(quantity: number) {
	if (quantity > 9_999_999) {
		return `${Math.floor(quantity / 1_000_000)}M`;
	} else if (quantity > 99_999) {
		return `${Math.floor(quantity / 1000)}K`;
	}
	return quantity.toString();
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

export function stringMatches(str: string, str2: string) {
	return cleanString(str) === cleanString(str2);
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

export function inlineCodeblock(input: string) {
	return `\`${input.replace(/ /g, '\u00A0').replace(/`/g, '`\u200B')}\``;
}

export function britishTime() {
	const currentDate = new Date(Date.now() - Time.Hour * 10);
	return currentDate;
}

export function isNightTime() {
	const time = britishTime();
	let hours = time.getHours();

	if (!production) hours = 20;
	return hours > 16 || hours < 5;
}

export function isWeekend() {
	const currentDate = new Date(Date.now() - Time.Hour * 6);
	return [6, 0].includes(currentDate.getDay());
}

export function saidYes(content: string) {
	const newContent = content.toLowerCase();
	return newContent === 'y' || newContent === 'yes';
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

export function itemNameFromID(itemID: number | string) {
	return Items.get(itemID)?.name;
}

export async function arrIDToUsers(client: KlasaClient, ids: string[]) {
	return Promise.all(ids.map(id => client.fetchUser(id)));
}

const rawEmojiRegex = emojiRegex();

export function stripEmojis(str: string) {
	return str.replace(rawEmojiRegex, '');
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
		if (skillingSetup.hasEquipped([id])) {
			boostPercent += percent;
			amountEquipped++;
		}
	}
	if (amountEquipped === 4) {
		boostPercent += 0.5;
	}
	return round(boostPercent, 1);
}

const rogueOutfit = resolveItems(['Rogue mask', 'Rogue top', 'Rogue trousers', 'Rogue gloves', 'Rogue boots']);

export function rogueOutfitPercentBonus(user: KlasaUser): number {
	const skillingSetup = user.getGear('skilling');
	let amountEquipped = 0;
	for (const id of rogueOutfit) {
		if (skillingSetup.hasEquipped([id])) {
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
			: randArrItem(continuationChars);

	return `${shuffleArr(CENA_CHARS).slice(0, randInt(1, 2)).join('')}${baseChar}${shuffleArr(CENA_CHARS)
		.slice(0, randInt(1, 2))
		.join('')}`;
}

export function isValidGearSetup(str: string): str is GearSetupType {
	return GearSetupTypes.includes(str as any);
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

export function isTobActivity(data: any): data is TheatreOfBloodTaskOptions {
	return 'wipedRoom' in data;
}

export function sha256Hash(x: string) {
	return crypto.createHash('sha256').update(x, 'utf8').digest('hex');
}

export function countSkillsAtleast99(user: KlasaUser) {
	const skills = (user.settings.get('skills') as SettingsFolder).toJSON() as Record<string, number>;
	return Object.values(skills).filter(xp => convertXPtoLVL(xp) >= 99).length;
}

export function getSupportGuild(client: Client) {
	const guild = client.guilds.cache.get(SupportServer);
	if (!guild) throw "Can't find support guild.";
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
export function channelIsSendable(channel: Channel | undefined | null): channel is TextChannel {
	if (!channel || (!(channel instanceof DMChannel) && !(channel instanceof TextChannel)) || !channel.postable) {
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

export function formatMissingItems(consumables: Consumable[], timeToFinish: number) {
	const str = [];

	for (const consumable of consumables) {
		str.push(formatItemCosts(consumable, timeToFinish));
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

export function updateBankSetting(client: KlasaClient | KlasaUser, setting: string, bankToAdd: Bank | ItemBank) {
	if (bankToAdd === undefined || bankToAdd === null) throw new Error(`Gave null bank for ${client} ${setting}`);
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

export function updateGPTrackSetting(client: KlasaClient | KlasaUser, setting: string, amount: number) {
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

export async function wipeDBArrayByKey(user: KlasaUser, key: string): Promise<SettingsUpdateResults> {
	const active: any[] = user.settings.get(key) as any[];
	return user.settings.update(key, active);
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
	return (
		str &&
		typeof str === 'string' &&
		str.length >= 2 &&
		str.length <= 30 &&
		['\n', '`', '@', '<', ':'].every(char => !str.includes(char)) &&
		stripEmojis(str).length === str.length
	);
}

export function patronMaxTripCalc(user: KlasaUser) {
	const perkTier = getUsersPerkTier(user);
	if (perkTier === PerkTier.Two) return Time.Minute * 3;
	else if (perkTier === PerkTier.Three) return Time.Minute * 6;
	else if (perkTier >= PerkTier.Four) return Time.Minute * 10;
	return 0;
}

export async function makePaginatedMessage(message: KlasaMessage, pages: MessageOptions[]) {
	const display = new PaginatedMessage();
	// @ts-ignore 2445
	display.setUpReactions = () => null;
	for (const page of pages) {
		display.addPage({
			...page,
			components:
				pages.length > 1
					? [
							PaginatedMessage.defaultActions
								.slice(1, -1)
								.map(a =>
									new MessageButton()
										.setLabel('')
										.setStyle('SECONDARY')
										.setCustomID(a.id)
										.setEmoji(a.id)
								)
					  ]
					: []
		});
	}

	await display.run(message);

	if (pages.length > 1) {
		const collector = display.response!.createMessageComponentInteractionCollector({
			time: Time.Minute,
			filter: i => i.user.id === message.author.id
		});

		collector.on('collect', async interaction => {
			for (const action of PaginatedMessage.defaultActions) {
				if (interaction.customID === action.id) {
					const previousIndex = display.index;

					await action.run({
						handler: display,
						author: message.author,
						channel: message.channel,
						response: display.response!,
						collector: display.collector!
					});

					if (previousIndex !== display.index) {
						await interaction.update(await display.resolvePage(message.channel, display.index));
						return;
					}
				}
			}
		});

		collector.on('end', () => {
			display.response!.edit({ components: [] });
		});
	}
}

export function isSuperUntradeable(item: number | Item) {
	const id = typeof item === 'number' ? item : item.id;
	if (id === 5021) return true;
	const fullItem = Items.get(id);
	if (fullItem?.customItemData?.isSuperUntradeable) {
		return true;
	}
	return id >= 40_000 && id <= 45_000;
}

export function birdhouseLimit(user: KlasaUser) {
	let base = 4;
	if (user.bitfield.includes(BitField.HasScrollOfTheHunt)) base += 4;
	if (user.hasItemEquippedAnywhere('Hunter master cape')) base += 4;
	return base;
}
export const asyncExec = promisify(exec);

export function getUsername(client: KlasaClient, id: string): string {
	return (client.commands.get('leaderboard') as any)!.getUsername(id);
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
export function isRaidsActivity(data: any): data is RaidsOptions {
	return 'challengeMode' in data;
}

export function getMonster(str: string): Monster {
	const mon = Monsters.find(_m => _m.name === str);

	if (!mon) {
		throw new Error(`Invalid monster name given: ${str}`);
	}
	return mon;
}
export function assert(condition: boolean, desc?: string) {
	if (!condition) throw new Error(desc);
}

export function calcDropRatesFromBank(bank: Bank, iterations: number, uniques: number[]) {
	let result = [];
	let uniquesReceived = 0;
	for (const [item, qty] of bank.items().sort((a, b) => a[1] - b[1])) {
		if (uniques.includes(item.id)) {
			uniquesReceived += qty;
		}
		result.push(`${qty}x ${item.name} (1 in ${(iterations / qty).toFixed(2)})`);
	}
	result.push(
		`${uniquesReceived}x Uniques (1 in ${iterations / uniquesReceived} which is ${calcWhatPercent(
			uniquesReceived,
			iterations
		)}%)`
	);
	return result.join(', ');
}

export function convertPercentChance(percent: number) {
	return (1 / (percent / 100)).toFixed(1);
}

export function murMurHashChance(input: string, percent: number) {
	const hash = murmurHash.v3(input) % 1e4;
	return hash < percent * 100;
}

const getMurKey = (input: string | number, sortHash: string) => `${input.toString()}-${sortHash}`;

export function murMurSort<T extends string | number>(arr: T[], sortHash: string) {
	return [...arr].sort((a, b) => murmurHash.v3(getMurKey(b, sortHash)) - murmurHash.v3(getMurKey(a, sortHash)));
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

export function convertBankToPerHourStats(bank: Bank, time: number) {
	let result = [];
	for (const [item, qty] of bank.items()) {
		result.push(`${(qty / (time / Time.Hour)).toFixed(1)}/hr ${item.name}`);
	}
	return result;
}

export function formatTimestamp(date: Date, relative = false) {
	const unixTime = date.getTime() / 1000;
	if (relative) {
		return `<t:${unixTime}:R>`;
	}
	return `<t:${unixTime}>`;
}

export function ISODateString(date?: Date) {
	return (date ?? new Date()).toISOString().slice(0, 10);
}

export function averageArr(arr: number[]) {
	return sumArr(arr) / arr.length;
}

/**
 * Removes items with 0 or less quantity
 */
export function sanitizeBank(bank: Bank) {
	for (const [key, value] of Object.entries(bank.bank)) {
		if (value === 0 || value < 1) {
			delete bank.bank[key];
		}
	}
}

export function isAtleastThisOld(date: Date | number, age: number) {
	const difference = Date.now() - (typeof date === 'number' ? date : date.getTime());
	return difference >= age;
}

export function truncateString(str: string, maxLen: number) {
	if (str.length < maxLen) return str;
	return `${str.slice(0, maxLen - 3)}...`;
}

export function cleanUsername(str: string) {
	return Util.escapeMarkdown(stripEmojis(str));
}
