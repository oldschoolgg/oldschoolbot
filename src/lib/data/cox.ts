import {
	Time,
	calcPercentOfNum,
	calcWhatPercent,
	increaseNumByPercent,
	percentChance,
	randInt,
	reduceNumByPercent,
	shuffleArr
} from 'e';
import { Bank, type Item } from 'oldschooljs';

import type { ChambersOfXericOptions } from 'oldschooljs/dist/simulation/misc/ChambersOfXeric';

import { checkUserCanUseDegradeableItem } from '../degradeableItems';
import type { GearStats } from '../gear/types';
import { getMinigameScore } from '../settings/minigames';
import { SkillsEnum } from '../skilling/types';
import { Gear, constructGearSetup } from '../structures/Gear';
import type { Skills } from '../types';
import { itemID, itemNameFromID, randomVariation, resolveItems } from '../util';
import getOSItem from '../util/getOSItem';
import { logError } from '../util/logError';
import { getSimilarItems } from './similarItems';

const bareMinStats: Skills = {
	attack: 80,
	strength: 80,
	defence: 80,
	ranged: 80,
	magic: 80,
	prayer: 70
};

export const coxUniques = [
	'Dexterous prayer scroll',
	'Arcane prayer scroll',
	'Twisted buckler',
	'Dragon hunter crossbow',
	"Dinh's bulwark",
	'Ancestral hat',
	'Ancestral robe top',
	'Ancestral robe bottom',
	'Dragon claws',
	'Elder maul',
	'Kodai insignia',
	'Twisted bow'
];

export const coxCMUniques = ['Metamorphic dust', 'Twisted ancestral colour kit'];

const SCYTHE_CHARGERS_PER_COX = 100;
const SHADOW_CHARGES_PER_COX = 120;
const SANGUINESTI_CHARGES_PER_COX = 160;
const TENTACLE_CHARGES_PER_COX = 200;

const REQUIRED_BOW = resolveItems(['Twisted bow', 'Bow of faerdhinen (c)', 'Magic shortbow']);
const REQUIRED_ARROWS = resolveItems(['Dragon arrow', 'Amethyst arrow', 'Rune arrow', 'Adamant arrow']);
const BOW_ARROWS_NEEDED = 150;
const REQUIRED_CROSSBOW = resolveItems([
	'Zaryte crossbow',
	'Dragon hunter crossbow',
	'Armadyl crossbow',
	'rune crossbow'
]);
const REQUIRED_BOLTS = resolveItems([
	'Ruby dragon bolts (e)',
	'Diamond dragon bolts (e)',
	'Dragon bolts',
	'Runite bolts'
]);
const CROSSBOW_BOLTS_NEEDED = 150;

export function hasMinRaidsRequirements(user: MUser) {
	return user.hasSkillReqs(bareMinStats);
}

function kcPointsEffect(kc: number) {
	if (kc < 5) return -70;
	if (kc < 10) return -40;
	if (kc < 15) return -25;
	if (kc < 25) return -10;
	if (kc < 50) return -5;
	if (kc < 100) return 10;
	if (kc < 150) return 20;
	if (kc < 200) return 25;
	return 30;
}

export async function createTeam(
	users: MUser[],
	cm: boolean
): Promise<Array<{ deaths: number; deathChance: number } & ChambersOfXericOptions['team'][0]>> {
	const res = [];
	const isSolo = users.length === 1;

	for (const u of users) {
		let points = 24_000;
		const { total } = calculateUserGearPercents(u);
		let deathChance = 20;
		if (total < 30) {
			points = 1000;
			deathChance += 20;
		} else if (total < 50) {
			points = 5000;
			deathChance += 10;
		} else {
			points = increaseNumByPercent(points, total / 10);
			deathChance -= calcPercentOfNum(total, 10);
		}

		const kc = await getMinigameScore(u.id, cm ? 'raids_challenge_mode' : 'raids');
		const kcChange = kcPointsEffect(kc);
		if (kcChange < 0) points = reduceNumByPercent(points, Math.abs(kcChange));
		else points = increaseNumByPercent(points, kcChange);

		const kcPercent = Math.min(100, calcWhatPercent(kc, 100));
		if (kc < 30) deathChance += Math.max(0, 30 - kc);
		deathChance -= calcPercentOfNum(kcPercent, 10);

		if (users.length > 1) {
			points -= Math.min(6, Math.max(3, users.length)) * Math.min(1600, calcPercentOfNum(15, points));
		} else {
			deathChance += 5;
		}

		if (cm) {
			deathChance *= 2;
			points = increaseNumByPercent(points, 40);
		}
		deathChance += 1;

		if (cm && kc > 20) {
			points += 5000;
		}

		if (isSolo && kc < 50) {
			deathChance += Math.max(30 - kc, 0);
		}

		let deaths = 0;
		for (let i = 0; i < randInt(1, 3); i++) {
			if (percentChance(deathChance)) {
				points = reduceNumByPercent(points, randInt(36, 44));
				++deaths;
			}
		}

		points = Math.floor(randomVariation(points, 5));
		if (points < 1 || points > 60_000) {
			logError(`${u.usernameOrMention} had ${points} points in a team of ${users.length}.`);
			points = 10_000;
		}

		const { bank } = u;
		res.push({
			id: u.id,
			personalPoints: points,
			canReceiveAncientTablet: !bank.has('Ancient tablet'),
			canReceiveDust: true,
			deaths,
			deathChance
		});
	}
	return res;
}

function calcSetupPercent(
	maxStats: GearStats,
	userStats: GearStats,
	heavyPenalizeStat: keyof GearStats,
	ignoreStats: (keyof GearStats)[],
	melee: boolean
) {
	let numKeys = 0;
	let totalPercent = 0;
	for (const [key, val] of Object.entries(maxStats) as [keyof GearStats, number][]) {
		if (val <= 0 || ignoreStats.includes(key)) continue;
		const rawPercent = Math.min(100, calcWhatPercent(userStats[key], val));
		totalPercent += rawPercent;
		numKeys++;
	}
	// For melee compare the highest melee attack stat of max setup with the highest melee attack stat of the user
	if (melee) {
		const maxMeleeStat = Math.max(maxStats.attack_stab, Math.max(maxStats.attack_slash, maxStats.attack_crush));
		const userMeleeStat = Math.max(userStats.attack_stab, Math.max(userStats.attack_slash, userStats.attack_crush));
		totalPercent += Math.min(100, calcWhatPercent(userMeleeStat, maxMeleeStat));
		numKeys++;
	}
	totalPercent /= numKeys;
	// Heavy penalize for having less than 50% in the main stat of this setup.
	if (userStats[heavyPenalizeStat] < maxStats[heavyPenalizeStat] / 2) {
		totalPercent = Math.floor(Math.max(0, totalPercent / 2));
	}
	return totalPercent;
}

// BIS CoX gear: https://oldschool.runescape.wiki/w/Chambers_of_Xeric/Strategies#Melee
export const COXMaxMageGear = constructGearSetup({
	head: 'Ancestral hat',
	neck: 'Occult necklace',
	body: 'Ancestral robe top',
	cape: 'Imbued saradomin cape',
	hands: 'Tormented bracelet',
	legs: 'Ancestral robe bottom',
	feet: 'Eternal boots',
	'2h': "Tumeken's shadow",
	ring: 'Magus ring'
});
const maxMage = new Gear(COXMaxMageGear);

export const COXMaxRangeGear = constructGearSetup({
	head: 'Masori mask(f)',
	neck: 'Necklace of anguish',
	body: 'Masori Body (f)',
	cape: "Blessed dizana's quiver",
	hands: 'Zaryte vambraces',
	legs: 'Masori chaps (f)',
	feet: 'Pegasian boots',
	'2h': 'Twisted bow',
	ring: 'Venator ring',
	ammo: 'Dragon arrow'
});
const maxRange = new Gear(COXMaxRangeGear);

export const COXMaxMeleeGear = constructGearSetup({
	head: 'Torva full helm',
	neck: 'Amulet of torture',
	body: 'Torva platebody',
	cape: 'Infernal cape',
	hands: 'Ferocious gloves',
	legs: 'Torva platelegs',
	feet: 'Primordial boots',
	'2h': 'Scythe of vitur',
	ring: 'Ultor ring'
});
const maxMelee = new Gear(COXMaxMeleeGear);

export function calculateUserGearPercents(user: MUser) {
	const melee = calcSetupPercent(
		maxMelee.stats,
		user.gear.melee.stats,
		'melee_strength',
		['attack_stab', 'attack_slash', 'attack_crush', 'attack_ranged', 'attack_magic'],
		true
	);
	const range = calcSetupPercent(
		maxRange.stats,
		user.gear.range.stats,
		'ranged_strength',
		['attack_stab', 'attack_slash', 'attack_crush', 'attack_magic'],
		false
	);
	const mage = calcSetupPercent(
		maxMage.stats,
		user.gear.mage.stats,
		'magic_damage',
		['attack_stab', 'attack_slash', 'attack_crush', 'attack_ranged'],
		false
	);
	return {
		melee,
		range,
		mage,
		total: (melee + range + mage) / 3
	};
}

export const minimumCoxSuppliesNeeded = new Bank({
	'Stamina potion(4)': 3,
	'Saradomin brew(4)': 10,
	'Super restore(4)': 5
});

export async function checkCoxTeam(users: MUser[], cm: boolean, quantity = 1): Promise<string | null> {
	const hasHerbalist = users.some(u => u.skillLevel(SkillsEnum.Herblore) >= 78);
	if (!hasHerbalist) {
		return 'nobody with at least level 78 Herblore';
	}
	const hasFarmer = users.some(u => u.skillLevel(SkillsEnum.Farming) >= 55);
	if (!hasFarmer) {
		return 'nobody with at least level 55 Farming';
	}
	const suppliesNeeded = minimumCoxSuppliesNeeded.clone().multiply(quantity);
	const userWithoutSupplies = users.find(u => !u.bank.has(suppliesNeeded));
	if (userWithoutSupplies) {
		return `${userWithoutSupplies.usernameOrMention} doesn't have enough supplies for ${quantity} Raid${
			quantity > 1 ? 's' : ''
		}`;
	}

	for (const user of users) {
		const { total } = calculateUserGearPercents(user);
		if (total < 20) {
			return 'Your gear is terrible! You do not stand a chance in the Chambers of Xeric.';
		}
		if (!hasMinRaidsRequirements(user)) {
			return `${user.usernameOrMention} doesn't meet the stat requirements to do the Chambers of Xeric.`;
		}
		if (cm) {
			if (users.length === 1 && !user.hasEquippedOrInBank('Twisted bow')) {
				return `${user.usernameOrMention} doesn't own a Twisted bow, which is required for solo Challenge Mode.`;
			}
			if (
				users.length > 1 &&
				!user.hasEquippedOrInBank('Dragon hunter crossbow') &&
				!user.hasEquippedOrInBank('Twisted bow') &&
				!user.hasEquipped(['Bow of faerdhinen (c)', 'Crystal helm', 'Crystal legs', 'Crystal body'], true)
			) {
				return `${user.usernameOrMention} doesn't own a Twisted bow, Bow of faerdhinen (c) or Dragon hunter crossbow, which is required for Challenge Mode.`;
			}
			const kc = await getMinigameScore(user.id, 'raids');
			if (kc < 200) {
				return `${user.usernameOrMention} doesn't have the 200 KC required for Challenge Mode.`;
			}
		}
		if (user.minionIsBusy) {
			return `${user.usernameOrMention}'s minion is already doing an activity and cannot join.`;
		}

		// Range weapon/ammo check
		const rangeAmmo = user.gear.range.ammo;
		const rangeWeapon = user.gear.range.equippedWeapon();
		const arrowsNeeded = BOW_ARROWS_NEEDED * quantity;
		const boltsNeeded = CROSSBOW_BOLTS_NEEDED * quantity;
		if (!rangeWeapon) return `<@${user.id}> Where is your range weapon?`;
		if (rangeWeapon?.id) {
			if (rangeWeapon.id !== itemID('Bow of faerdhinen (c)')) {
				if (REQUIRED_BOW.includes(rangeWeapon.id)) {
					if (!rangeAmmo || rangeAmmo.quantity < arrowsNeeded || !REQUIRED_ARROWS.includes(rangeAmmo.item)) {
						return `<@${user.id}> needs ${arrowsNeeded} of one of these arrows equipped: ${REQUIRED_ARROWS.map(itemNameFromID).join(', ')}.`;
					}
				} else if (REQUIRED_CROSSBOW.includes(rangeWeapon.id)) {
					if (!rangeAmmo || rangeAmmo.quantity < boltsNeeded || !REQUIRED_BOLTS.includes(rangeAmmo.item)) {
						return `<@${user.id}> needs ${boltsNeeded} of ones of these bolts equipped: ${REQUIRED_BOLTS.map(itemNameFromID).join(', ')}.`;
					}
				}
			}
		}

		// Charge weapons check
		if (user.gear.melee.hasEquipped('Scythe of vitur')) {
			const scytheResult = checkUserCanUseDegradeableItem({
				item: getOSItem('Scythe of vitur'),
				chargesToDegrade: SCYTHE_CHARGERS_PER_COX * quantity,
				user
			});
			if (!scytheResult.hasEnough) {
				return scytheResult.userMessage;
			}
		}
		if (user.gear.melee.hasEquipped('Abyssal tentacle')) {
			const tentacleResult = checkUserCanUseDegradeableItem({
				item: getOSItem('Abyssal tentacle'),
				chargesToDegrade: TENTACLE_CHARGES_PER_COX * quantity,
				user
			});
			if (!tentacleResult.hasEnough) {
				return tentacleResult.userMessage;
			}
		}
		if (user.gear.mage.hasEquipped('Sanguinesti staff')) {
			const sangResult = checkUserCanUseDegradeableItem({
				item: getOSItem('Sanguinesti staff'),
				chargesToDegrade: SANGUINESTI_CHARGES_PER_COX * quantity,
				user
			});
			if (!sangResult.hasEnough) {
				return sangResult.userMessage;
			}
		}
		if (user.gear.mage.hasEquipped("Tumeken's shadow")) {
			const shadowResult = checkUserCanUseDegradeableItem({
				item: getOSItem("Tumeken's shadow"),
				chargesToDegrade: SHADOW_CHARGES_PER_COX * quantity,
				user
			});
			if (!shadowResult.hasEnough) {
				return shadowResult.userMessage;
			}
		}
	}

	return null;
}

function kcEffectiveness(challengeMode: boolean, isSolo: boolean, normalKC: number, cmKC: number) {
	const kc = challengeMode ? cmKC : normalKC;

	let cap = isSolo ? 250 : 400;
	if (challengeMode) {
		cap = isSolo ? 75 : 100;
	}
	const kcEffectiveness = Math.min(100, calcWhatPercent(kc, cap));
	return kcEffectiveness;
}

const { ceil } = Math;
function calcPerc(perc: number, num: number) {
	return ceil(calcPercentOfNum(ceil(perc), num));
}

function teamSizeBoostPercent(size: number) {
	switch (size) {
		case 1:
			return -6;
		case 2:
			return 7;
		case 3:
			return 13;
		case 4:
			return 18;
		case 5:
			return 23;
		default:
			return 23;
	}
}

interface ItemBoost {
	item: Item;
	boost: number;
	mustBeEquipped: boolean;
	setup?: 'melee' | 'mage' | 'range';
	mustBeCharged?: boolean;
	requiredCharges?: number;
}

export const itemBoosts: ItemBoost[][] = [
	[
		// melee weapon boost
		{
			item: getOSItem('Scythe of vitur'),
			boost: 8,
			mustBeEquipped: true,
			setup: 'melee',
			mustBeCharged: true,
			requiredCharges: SCYTHE_CHARGERS_PER_COX
		},
		{
			item: getOSItem('Dragon hunter lance'),
			boost: 5,
			mustBeEquipped: true,
			setup: 'melee'
		},
		{
			item: getOSItem('Soulreaper axe'),
			boost: 4,
			mustBeEquipped: true,
			setup: 'melee'
		},
		{
			item: getOSItem("Osmumten's fang"),
			boost: 3,
			mustBeEquipped: true,
			setup: 'melee'
		},
		{
			item: getOSItem('Abyssal tentacle'),
			boost: 2,
			mustBeEquipped: true,
			setup: 'melee',
			mustBeCharged: true,
			requiredCharges: TENTACLE_CHARGES_PER_COX
		}
	],
	[
		// Range weapon boost
		{
			item: getOSItem('Twisted bow'),
			boost: 8,
			mustBeEquipped: true,
			setup: 'range'
		},
		{
			item: getOSItem('Bow of faerdhinen (c)'),
			boost: 5,
			mustBeEquipped: true,
			setup: 'range'
		},
		{
			item: getOSItem('Dragon hunter crossbow'),
			boost: 4,
			mustBeEquipped: true,
			setup: 'range'
		},
		{
			item: getOSItem('Zaryte crossbow'),
			boost: 3,
			mustBeEquipped: true,
			setup: 'range'
		}
	],
	[
		// range ammo boost
		{
			item: getOSItem('Dragon arrow'),
			boost: 3,
			mustBeEquipped: true,
			setup: 'range'
		},
		{
			item: getOSItem('Ruby dragon bolts (e)'),
			boost: 2,
			mustBeEquipped: true,
			setup: 'range'
		},
		{
			item: getOSItem('Diamond dragon bolts (e)'),
			boost: 2,
			mustBeEquipped: true,
			setup: 'range'
		},
		{
			item: getOSItem('Amethyst arrow'),
			boost: 1,
			mustBeEquipped: true,
			setup: 'range'
		},
		{
			item: getOSItem('Ruby dragon bolts'),
			boost: 1,
			mustBeEquipped: true,
			setup: 'range'
		},
		{
			item: getOSItem('Diamond dragon bolts'),
			boost: 1,
			mustBeEquipped: true,
			setup: 'range'
		},
		{
			item: getOSItem('Dragon bolts'),
			boost: 1,
			mustBeEquipped: true,
			setup: 'range'
		}
	],
	[
		// mage weapon boost
		{
			item: getOSItem("Tumeken's shadow"),
			boost: 8,
			mustBeEquipped: true,
			setup: 'mage',
			mustBeCharged: true,
			requiredCharges: SHADOW_CHARGES_PER_COX
		},
		{
			item: getOSItem('Sanguinesti staff'),
			boost: 4,
			mustBeEquipped: true,
			setup: 'mage',
			mustBeCharged: true,
			requiredCharges: SANGUINESTI_CHARGES_PER_COX
		}
	],
	[
		// defense reduction weapon boost
		{
			item: getOSItem('Elder maul'),
			boost: 5,
			mustBeEquipped: false
		},
		{
			item: getOSItem('Dragon warhammer'),
			boost: 3,
			mustBeEquipped: false
		},
		{
			item: getOSItem('Bandos godsword'),
			boost: 2.5,
			mustBeEquipped: false
		}
	],
	[
		// zaryte crossbow spec weapon
		{
			item: getOSItem('Zaryte crossbow'),
			boost: 3,
			mustBeEquipped: false
		}
	],
	[
		// lightbearer increases spec
		{
			item: getOSItem('Lightbearer'),
			boost: 2,
			mustBeEquipped: false
		}
	],
	[
		// pickaxe boost
		{
			item: getOSItem('Dragon pickaxe'),
			boost: 1,
			mustBeEquipped: false
		}
	]
];

const speedReductionForGear = 14;
const speedReductionForKC = 28;

export const maxSpeedReductionFromItems = itemBoosts.reduce(
	(sum, items) => sum + Math.max(...items.map(item => item.boost)),
	0
);

const maxSpeedReductionUser = speedReductionForGear + speedReductionForKC + maxSpeedReductionFromItems;

const baseDuration = Time.Minute * 83;
const baseCmDuration = Time.Minute * 110;

export async function calcCoxDuration(
	_team: MUser[],
	challengeMode: boolean
): Promise<{
	reductions: Record<string, number>;
	duration: number;
	maxUserReduction: number;
	degradeables: { item: Item; user: MUser; chargesToDegrade: number }[];
}> {
	const team = shuffleArr(_team).slice(0, 9);
	const size = team.length;

	let totalReduction = 0;
	const reductions: Record<string, number> = {};

	// Track degradeable items (fakemass works properly with this code, it wont remove 5x charges):
	const degradeableItems: { item: Item; user: MUser; chargesToDegrade: number }[] = [];
	const uniqueUsers = new Map();

	for (const u of team) {
		let userPercentChange = 0;
		const isUserReal = !uniqueUsers.has(u.id);
		uniqueUsers.set(u.id, true);

		// Reduce time for gear
		const { total } = calculateUserGearPercents(u);
		userPercentChange += calcPerc(total, speedReductionForGear);

		// Reduce time for KC
		const stats = await u.fetchMinigames();
		const kcPercent = kcEffectiveness(challengeMode, team.length === 1, stats.raids, stats.raids_challenge_mode);
		userPercentChange += calcPerc(kcPercent, speedReductionForKC);

		// Reduce time for item boosts
		for (const set of itemBoosts) {
			for (const item of set) {
				const simItems = getSimilarItems(item.item.id);
				if (item.mustBeEquipped && item.mustBeCharged && item.requiredCharges) {
					if (u.hasEquipped(simItems)) {
						const testItem = {
							item: item.item,
							user: u,
							chargesToDegrade: item.requiredCharges
						};
						const canDegrade = checkUserCanUseDegradeableItem(testItem);
						if (canDegrade.hasEnough) {
							userPercentChange += item.boost;
							if (isUserReal) degradeableItems.push(testItem);
							break;
						}
					}
				} else if (item.mustBeCharged && item.requiredCharges) {
					if (u.hasEquippedOrInBank(simItems)) {
						const testItem = {
							item: item.item,
							user: u,
							chargesToDegrade: item.requiredCharges
						};
						const canDegrade = checkUserCanUseDegradeableItem(testItem);
						if (canDegrade.hasEnough) {
							userPercentChange += item.boost;
							if (isUserReal) degradeableItems.push(testItem);
							break;
						}
					}
				} else if (item.mustBeEquipped) {
					if (item.setup && u.gear[item.setup].hasEquipped(simItems)) {
						userPercentChange += item.boost;
						break;
					} else if (!item.setup && u.hasEquipped(simItems)) {
						userPercentChange += item.boost;
						break;
					}
				} else if (u.hasEquippedOrInBank(simItems)) {
					userPercentChange += item.boost;
					break;
				}
			}
		}

		const perc = Math.min(100, userPercentChange / size);

		totalReduction += perc;
		reductions[u.id] = perc;
	}
	let duration = baseDuration;

	if (challengeMode) {
		duration = baseCmDuration;
		duration = reduceNumByPercent(duration, totalReduction / 1.05);
	} else {
		duration = reduceNumByPercent(duration, totalReduction);
	}

	duration -= duration * (teamSizeBoostPercent(size) / 100);

	return { duration, reductions, maxUserReduction: maxSpeedReductionUser / size, degradeables: degradeableItems };
}

export async function calcCoxInput(u: MUser, quantity: number, solo: boolean) {
	const supplies = new Bank();
	const ammo = new Bank();
	for (let i = 0; i < quantity; i++) {
		const kc = await getMinigameScore(u.id, 'raids');
		supplies.add('Stamina potion(4)', solo ? 2 : 1);

		let brewsNeeded = Math.max(1, 8 - Math.max(1, Math.ceil((kc + 1) / 30)));
		if (solo) brewsNeeded++;
		const restoresNeeded = Math.max(1, Math.floor(brewsNeeded / 3));

		supplies.add('Saradomin brew(4)', brewsNeeded);
		supplies.add('Super restore(4)', restoresNeeded);

		// get ammo usage (checkCoxTeam() handles checking the proper amount and correct ammo type)
		const rangeAmmo = u.gear.range.ammo;
		const rangeWeapon = u.gear.range.equippedWeapon();
		if (rangeWeapon?.id !== itemID('Bow of faerdhinen (c)') && rangeWeapon && rangeAmmo) {
			if (REQUIRED_BOW.includes(rangeWeapon.id)) {
				ammo.add(rangeAmmo.item, BOW_ARROWS_NEEDED);
			} else if (REQUIRED_CROSSBOW.includes(rangeWeapon.id)) {
				ammo.add(rangeAmmo.item, CROSSBOW_BOLTS_NEEDED);
			}
		}
	}
	return { supplies, ammo };
}
