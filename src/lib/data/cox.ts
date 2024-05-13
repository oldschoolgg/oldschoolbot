import {
	calcPercentOfNum,
	calcWhatPercent,
	increaseNumByPercent,
	percentChance,
	randInt,
	reduceNumByPercent,
	shuffleArr,
	Time
} from 'e';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { ChambersOfXericOptions } from 'oldschooljs/dist/simulation/misc/ChambersOfXeric';

import { checkUserCanUseDegradeableItem } from '../degradeableItems';
import { GearStats } from '../gear/types';
import { inventionBoosts } from '../invention/inventions';
import { getMinigameScore } from '../settings/minigames';
import { SkillsEnum } from '../skilling/types';
import { constructGearSetup, Gear } from '../structures/Gear';
import { Skills } from '../types';
import { randomVariation } from '../util';
import getOSItem from '../util/getOSItem';
import { logError } from '../util/logError';

export const bareMinStats: Skills = {
	attack: 80,
	strength: 80,
	defence: 80,
	ranged: 80,
	magic: 80,
	prayer: 70
};

export const SANGUINESTI_CHARGES_PER_COX = 150;
export const SHADOW_CHARGES_PER_COX = 130;
export const TENTACLE_CHARGES_PER_COX = 200;
export const VOID_STAFF_CHARGES_PER_COX = 15;

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
	let res = [];
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

export function calcSetupPercent(
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
		let maxMeleeStat = Math.max(
			maxStats['attack_stab'],
			Math.max(maxStats['attack_slash'], maxStats['attack_crush'])
		);
		let userMeleeStat = Math.max(
			userStats['attack_stab'],
			Math.max(userStats['attack_slash'], userStats['attack_crush'])
		);
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

export const maxMageGear = constructGearSetup({
	head: 'Virtus mask',
	body: 'Virtus robe top',
	hands: 'Virtus gloves',
	legs: 'Virtus robe legs',
	feet: 'Virtus boots',
	cape: 'Vasa cloak',
	neck: 'Arcane blast necklace',
	weapon: 'Virtus wand',
	shield: 'Virtus book',
	ring: 'Seers ring(i)'
});
const maxMage = new Gear(maxMageGear);

export const maxRangeGear = constructGearSetup({
	head: 'Pernix cowl',
	neck: 'Farsight snapshot necklace',
	body: 'Pernix body',
	cape: 'Tidal collector',
	hands: 'Pernix gloves',
	legs: 'Pernix chaps',
	feet: 'Pernix boots',
	'2h': 'Twisted bow',
	ring: 'Ring of piercing(i)',
	ammo: 'Dragon arrow'
});
const maxRange = new Gear(maxRangeGear);

export const maxMeleeGear = constructGearSetup({
	head: 'Torva full helm',
	neck: "Brawler's hook necklace",
	body: 'Torva platebody',
	cape: 'TzKal cape',
	hands: 'Torva gloves',
	legs: 'Torva platelegs',
	feet: 'Torva boots',
	weapon: 'Drygore rapier',
	shield: 'Offhand drygore rapier',
	ring: 'Ignis ring(i)'
});
const maxMelee = new Gear(maxMeleeGear);

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

export async function checkCoxTeam(users: MUser[], cm: boolean, quantity: number = 1): Promise<string | null> {
	const hasHerbalist = users.some(u => u.skillLevel(SkillsEnum.Herblore) >= 78);
	if (!hasHerbalist) {
		return 'nobody with atleast level 78 Herblore';
	}
	const hasFarmer = users.some(u => u.skillLevel(SkillsEnum.Farming) >= 55);
	if (!hasFarmer) {
		return 'nobody with atleast level 55 Farming';
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
				!['Twisted bow', 'Zaryte bow', 'Bow of faerdhinen (c)'].some(i => user.hasEquippedOrInBank(i))
			) {
				return `${user.usernameOrMention} doesn't own a Twisted bow, Zaryte bow, Bow of faerdhinen (c) or Dragon hunter crossbow, which is required for Challenge Mode.`;
			}
			const kc = await getMinigameScore(user.id, 'raids');
			if (kc < 200) {
				return `${user.usernameOrMention} doesn't have the 200 KC required for Challenge Mode.`;
			}
		}
		if (user.minionIsBusy) {
			return `${user.usernameOrMention}'s minion is already doing an activity and cannot join.`;
		}
		if (user.gear.melee.hasEquipped('Abyssal tentacle')) {
			const tentacleResult = checkUserCanUseDegradeableItem({
				item: getOSItem('Abyssal tentacle'),
				chargesToDegrade: TENTACLE_CHARGES_PER_COX,
				user
			});
			if (!tentacleResult.hasEnough) {
				return tentacleResult.userMessage;
			}
		}
		if (user.gear.mage.hasEquipped('Sanguinesti staff')) {
			const sangResult = checkUserCanUseDegradeableItem({
				item: getOSItem('Sanguinesti staff'),
				chargesToDegrade: SANGUINESTI_CHARGES_PER_COX,
				user
			});
			if (!sangResult.hasEnough) {
				return sangResult.userMessage;
			}
		}
		if (user.gear.mage.hasEquipped('Void staff')) {
			const voidStaffResult = checkUserCanUseDegradeableItem({
				item: getOSItem('Void staff'),
				chargesToDegrade: VOID_STAFF_CHARGES_PER_COX,
				user
			});
			if (!voidStaffResult.hasEnough) {
				return voidStaffResult.userMessage;
			}
		}
		if (user.gear.mage.hasEquipped("Tumeken's shadow")) {
			const shadowResult = checkUserCanUseDegradeableItem({
				item: getOSItem("Tumeken's shadow"),
				chargesToDegrade: SHADOW_CHARGES_PER_COX,
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
			return -10;
		case 2:
			return 12;
		case 3:
			return 13;
		case 4:
			return 18;
		case 5:
			return 23;
		case 6:
			return 26;
		case 7:
			return 29;
		case 8:
			return 33;
		default:
			return 35;
	}
}

interface ItemBoost {
	item: Item;
	boost: number;
	mustBeEquipped: boolean;
	setup?: 'mage' | 'range' | 'melee';
	mustBeCharged?: boolean;
	requiredCharges?: number;
}

const itemBoosts: ItemBoost[][] = [
	[
		{
			item: getOSItem('Twisted bow'),
			boost: 7,
			mustBeEquipped: false
		},
		{
			item: getOSItem('Bow of faerdhinen (c)'),
			boost: 6,
			mustBeEquipped: false
		},
		{
			item: getOSItem('Dragon hunter crossbow'),
			boost: 5,
			mustBeEquipped: false
		}
	],
	[
		{
			item: getOSItem('Dragon warhammer'),
			boost: 3,
			mustBeEquipped: false
		},
		{
			item: getOSItem('Bandos godsword'),
			boost: 2.5,
			mustBeEquipped: false
		},
		{
			item: getOSItem('Bandos godsword (or)'),
			boost: 2.5,
			mustBeEquipped: false
		}
	],
	[
		{
			item: getOSItem('Drygore rapier'),
			boost: 8,
			mustBeEquipped: true
		},
		{
			item: getOSItem('Dragon hunter lance'),
			boost: 3,
			mustBeEquipped: false
		},
		{
			item: getOSItem('Abyssal tentacle'),
			boost: 2,
			mustBeEquipped: false,
			mustBeCharged: true,
			requiredCharges: TENTACLE_CHARGES_PER_COX
		}
	],
	[
		{
			item: getOSItem('Void staff'),
			boost: 9,
			mustBeEquipped: true,
			setup: 'mage',
			mustBeCharged: true,
			requiredCharges: VOID_STAFF_CHARGES_PER_COX
		},
		{
			item: getOSItem("Tumeken's shadow"),
			boost: 8,
			mustBeEquipped: false,
			setup: 'mage',
			mustBeCharged: true,
			requiredCharges: SHADOW_CHARGES_PER_COX
		},
		{
			item: getOSItem('Sanguinesti staff'),
			boost: 7,
			mustBeEquipped: false,
			setup: 'mage',
			mustBeCharged: true,
			requiredCharges: SANGUINESTI_CHARGES_PER_COX
		}
	],
	[
		{
			item: getOSItem('Offhand spidergore rapier'),
			boost: 6.5,
			mustBeEquipped: true,
			setup: 'melee'
		},
		{
			item: getOSItem('Offhand drygore rapier'),
			boost: 4,
			mustBeEquipped: true,
			setup: 'melee'
		}
	]
];

const speedReductionForGear = 16;
const speedReductionForKC = 40;

const maxSpeedReductionFromItems = itemBoosts.reduce(
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
	chinCannonUser: MUser | null;
}> {
	const team = shuffleArr(_team).slice(0, 9);
	const size = team.length;

	let totalReduction = 0;

	let reductions: Record<string, number> = {};

	// Track degradeable items:
	const degradeableItems: { item: Item; user: MUser; chargesToDegrade: number }[] = [];

	for (const u of team) {
		let userPercentChange = 0;

		// Reduce time for gear
		const { total } = calculateUserGearPercents(u);
		userPercentChange += calcPerc(total, speedReductionForGear);

		// Reduce time for KC
		const stats = await u.fetchMinigames();
		const kcPercent = kcEffectiveness(challengeMode, team.length === 1, stats.raids, stats.raids_challenge_mode);
		userPercentChange += calcPerc(kcPercent, speedReductionForKC);

		// Reduce time for item boosts
		itemBoosts.forEach(set => {
			for (const item of set) {
				if (item.mustBeCharged && item.requiredCharges) {
					if (u.hasEquippedOrInBank(item.item.id)) {
						const testItem = {
							item: item.item,
							user: u,
							chargesToDegrade: item.requiredCharges
						};
						const canDegrade = checkUserCanUseDegradeableItem(testItem);
						if (canDegrade.hasEnough) {
							userPercentChange += item.boost;
							degradeableItems.push(testItem);
							break;
						}
					}
				} else if (item.mustBeEquipped) {
					if (item.setup && u.gear[item.setup].hasEquipped(item.item.id)) {
						userPercentChange += item.boost;
						break;
					} else if (!item.setup && u.hasEquipped(item.item.id)) {
						userPercentChange += item.boost;
						break;
					}
				} else if (u.hasEquippedOrInBank(item.item.id)) {
					userPercentChange += item.boost;
					break;
				}
			}
		});

		let perc = Math.min(100, userPercentChange / size);

		totalReduction += perc;
		reductions[u.id] = perc;
	}
	let duration = baseDuration;

	if (challengeMode) {
		duration = baseCmDuration;
		duration = reduceNumByPercent(duration, totalReduction / 1.3);
	} else {
		duration = reduceNumByPercent(duration, totalReduction);
	}

	duration -= duration * (teamSizeBoostPercent(size) / 100);

	let chinCannonUser: MUser | null = null;

	for (const u of team) {
		if (u.gear.range.hasEquipped('Chincannon')) {
			duration = reduceNumByPercent(duration, inventionBoosts.chincannon.coxPercentReduction);
			chinCannonUser = u;
			break;
		}
	}

	return {
		duration,
		reductions,
		maxUserReduction: maxSpeedReductionUser / size,
		degradeables: degradeableItems,
		chinCannonUser
	};
}

export async function calcCoxInput(u: MUser, solo: boolean) {
	const items = new Bank();
	const kc = await getMinigameScore(u.id, 'raids');
	items.add('Stamina potion(4)', solo ? 2 : 1);

	let brewsNeeded = Math.max(1, 8 - Math.max(1, Math.ceil((kc + 1) / 30)));
	if (solo) brewsNeeded++;
	const restoresNeeded = Math.max(1, Math.floor(brewsNeeded / 3));

	items.add('Saradomin brew(4)', brewsNeeded);
	items.add('Super restore(4)', restoresNeeded);

	return items;
}
