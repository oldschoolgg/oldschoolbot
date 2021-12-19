import { calcPercentOfNum, calcWhatPercent, percentChance, randInt, reduceNumByPercent, round, Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { checkUserCanUseDegradeableItem } from '../degradeableItems';
import { constructGearSetup, GearStats } from '../gear';
import { blowpipeDarts } from '../minions/functions/blowpipeCommand';
import { getMinigameScore } from '../settings/minigames';
import { UserSettings } from '../settings/types/UserSettings';
import { Gear } from '../structures/Gear';
import { Skills } from '../types';
import { assert, formatSkillRequirements, randomVariation, skillsMeetRequirements } from '../util';
import getOSItem from '../util/getOSItem';
import resolveItems from '../util/resolveItems';

export const bareMinStats: Skills = {
	attack: 90,
	strength: 90,
	defence: 90,
	ranged: 90,
	magic: 94,
	prayer: 77
};

export const totalXPFromRaid = {
	[SkillsEnum.Attack]: 12_000,
	[SkillsEnum.Hitpoints]: 13_100,
	[SkillsEnum.Strength]: 12_000,
	[SkillsEnum.Ranged]: 1000,
	[SkillsEnum.Defence]: 12_000,
	[SkillsEnum.Magic]: 1000
} as const;

export interface TOBRoom {
	name: string;
	difficultyRating: number;
	timeWeighting: number;
}
export const TOBRooms: TOBRoom[] = [
	{
		name: 'Maiden',
		difficultyRating: 1,
		timeWeighting: 11
	},
	{
		name: 'Bloat',
		difficultyRating: 4,
		timeWeighting: 11
	},
	{
		name: 'Nylocas',
		difficultyRating: 3,
		timeWeighting: 22
	},
	{
		name: 'Soteseteg',
		difficultyRating: 2,
		timeWeighting: 11
	},
	{
		name: 'Xarps',
		difficultyRating: 2,
		timeWeighting: 17
	},
	{
		name: 'Vitir Verizk',
		difficultyRating: 6,
		timeWeighting: 28
	}
];

interface TOBDeaths {
	/**
	 * An array, where each item is the index of the room they died in.
	 */
	deaths: number[];
	deathChances: { name: string; deathChance: number }[];
}

export function calculateTOBDeaths(
	kc: number,
	hardKC: number,
	attempts: number,
	hardAttempts: number,
	isHardMode: boolean
): TOBDeaths {
	let deaths: number[] = [];
	let deathChances: { name: string; deathChance: number }[] = [];

	// This shifts the graph left or right, to start getting kc sooner or later. Higher = sooner:
	const minionLearningBase = isHardMode ? 5 : 2;
	const minionLearning = minionLearningBase + Math.floor(Math.min(20, (isHardMode ? hardAttempts : attempts) / 2));
	const basePosition = isHardMode ? 92 : 85;
	const difficultySlider = isHardMode ? 32 : 36; // Lower is harder. Be careful with this. (30 default).
	const curveStrength = isHardMode ? 2 : 2.5; // 1 - 5. Higher numbers mean a slower learning curve. (2.5 default)
	const baseKC = isHardMode ? hardKC : kc;

	let baseDeathChance = Math.floor(
		basePosition - (Math.log(baseKC / curveStrength + minionLearning) / Math.log(Math.sqrt(100))) * difficultySlider
	);

	baseDeathChance = Math.max(Math.min(baseDeathChance, 99.9), 3);

	for (let i = 0; i < TOBRooms.length; i++) {
		const room = TOBRooms[i];
		const deathChance = Math.min(98, (1 + room.difficultyRating / 10) * baseDeathChance);
		if (percentChance(deathChance)) {
			deaths.push(i);
		}
		deathChances.push({ name: room.name, deathChance });
	}

	return { deaths, deathChances };
}

export const baseTOBUniques = resolveItems([
	'Scythe of vitur',
	'Ghrazi rapier',
	'Sanguinesti staff',
	'Justiciar faceguard',
	'Justiciar chestguard',
	'Justiciar legguards',
	'Avernic defender hilt'
]);

export const TOBUniques = resolveItems([
	...baseTOBUniques,
	"Lil' zik",
	'Sanguine dust',
	'Sanguine ornament kit',
	'Holy ornament kit'
]);

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

export const TOBMaxMageGear = constructGearSetup({
	head: 'Ancestral hat',
	neck: 'Occult necklace',
	body: 'Ancestral robe top',
	cape: 'Imbued saradomin cape',
	hands: 'Tormented bracelet',
	legs: 'Ancestral robe bottom',
	feet: 'Eternal boots',
	weapon: 'Harmonised nightmare staff',
	shield: 'Arcane spirit shield',
	ring: 'Seers ring(i)'
});
const maxMage = new Gear(TOBMaxMageGear);

export const TOBMaxRangeGear = constructGearSetup({
	head: 'Void ranger helm',
	neck: 'Necklace of anguish',
	body: 'Elite void top',
	cape: "Ava's assembler",
	hands: 'Void knight gloves',
	legs: 'Elite void robe',
	feet: 'Pegasian boots',
	'2h': 'Twisted bow',
	ring: 'Archers ring(i)',
	ammo: 'Dragon arrow'
});
const maxRange = new Gear(TOBMaxRangeGear);
maxRange.ammo!.quantity = 10_000;

export const TOBMaxMeleeGear = constructGearSetup({
	head: 'Neitiznot faceguard',
	neck: 'Amulet of torture',
	body: 'Bandos chestplate',
	cape: 'Infernal cape',
	hands: 'Ferocious gloves',
	legs: 'Bandos tassets',
	feet: 'Primordial boots',
	weapon: 'Abyssal tentacle',
	ring: 'Berserker ring(i)',
	shield: 'Avernic defender'
});
const maxMelee = new Gear(TOBMaxMeleeGear);

export function calculateTOBUserGearPercents(user: KlasaUser) {
	const melee = calcSetupPercent(
		maxMelee.stats,
		user.getGear('melee').stats,
		'melee_strength',
		['attack_stab', 'attack_slash', 'attack_crush', 'attack_ranged', 'attack_magic'],
		true
	);
	const range = calcSetupPercent(
		maxRange.stats,
		user.getGear('range').stats,
		'ranged_strength',
		['attack_stab', 'attack_slash', 'attack_crush', 'attack_magic'],
		false
	);
	const mage = calcSetupPercent(
		maxMage.stats,
		user.getGear('mage').stats,
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

export const TENTACLE_CHARGES_PER_RAID = 400;

export async function checkTOBUser(user: KlasaUser, isHardMode: boolean): Promise<[false] | [true, string]> {
	if (!user.hasMinion) {
		return [true, `${user.username} doesn't have a minion`];
	}
	if (user.minionIsBusy) {
		return [true, `${user.username} minion is busy`];
	}

	if (!skillsMeetRequirements(user.rawSkills, bareMinStats)) {
		return [
			true,
			`${
				user.username
			} doesn't meet the skill requirements to do the Theatre of Blood, you need: ${formatSkillRequirements(
				bareMinStats
			)}.`
		];
	}

	if (!user.owns(minimumCoxSuppliesNeeded)) {
		return [
			true,
			`${user.username} doesn't have enough items, you need a minimum of this amount of items: ${minimumCoxSuppliesNeeded}.`
		];
	}
	const { total } = calculateTOBUserGearPercents(user);
	if (total < 20) {
		return [true, `${user.username}'s gear is terrible! You do not stand a chance in the Chambers of Xeric`];
	}

	const cost = await calcTOBInput(user);
	cost.add('Coins', 100_000).add('Rune pouch');
	if (!user.owns(cost)) {
		return [true, `${user.username} doesn't own ${cost.remove(user.bank())}`];
	}

	/**
	 *
	 *
	 * Gear
	 *
	 *
	 */

	// Melee
	const meleeGear = user.getGear('melee');
	if (
		!meleeGear.hasEquipped(['Abyssal tentacle', 'Blade of saeldor (c)', 'Scythe of vitur']) ||
		!meleeGear.hasEquipped(['Fire cape', 'Infernal cape'])
	) {
		return [
			true,
			`${user.username} needs an Abyssal tentacle/Blade of saeldor(c) and Fire/Infernal cape in their melee setup!`
		];
	}

	if (meleeGear.hasEquipped('Abyssal tentacle')) {
		const tentacleResult = checkUserCanUseDegradeableItem({
			item: getOSItem('Abyssal tentacle'),
			chargesToDegrade: TENTACLE_CHARGES_PER_RAID,
			user
		});
		if (!tentacleResult.hasEnough) {
			return [true, tentacleResult.userMessage];
		}
	}

	// Range

	const blowpipeData = user.settings.get(UserSettings.Blowpipe);
	if (!user.owns('Toxic blowpipe') || !blowpipeData.scales || !blowpipeData.dartID || !blowpipeData.dartQuantity) {
		return [
			true,
			`${user.username} needs a Toxic blowpipe (with darts and scales equipped) in their bank to do the Theatre of Blood.`
		];
	}
	const dartIndex = blowpipeDarts.indexOf(getOSItem(blowpipeData.dartID));
	if (dartIndex < 5) {
		return [true, `${user.username}'s darts are too weak`];
	}

	const rangeGear = user.getGear('range');
	if (
		!rangeGear.hasEquipped(['Magic shortbow', 'Twisted bow']) ||
		!rangeGear.hasEquipped(['Rune arrow', 'Dragon arrow'])
	) {
		return [
			true,
			`${user.username} needs a Magic shortbow or Twisted bow, and rune/dragon arrows, in their range setup!`
		];
	}
	if (rangeGear.hasEquipped(['Dragon arrow', 'Magic shortbow'], true)) {
		return [true, `${user.username}, you can't use Dragon arrows with a Magic shortbow 🤨`];
	}

	if (rangeGear.ammo!.quantity < 150) {
		return [true, `${user.username}, you need atleast 150 arrows equipped in your range setup.`];
	}

	if (isHardMode) {
		const kc = await getMinigameScore(user.id, 'tob');

		if (kc < 250) {
			return [true, `${user.username} needs atleast 250 Theatre of Blood KC before doing Hard mode.`];
		}
		if (!meleeGear.hasEquipped('Infernal cape')) {
			return [true, `${user.username} needs an Infernal cape to do Hard mode.`];
		}
	}

	return [false];
}

export async function checkTOBTeam(users: KlasaUser[], isHardMode: boolean): Promise<string | null> {
	const userWithoutSupplies = users.find(u => !u.owns(minimumCoxSuppliesNeeded));
	if (userWithoutSupplies) {
		return `${userWithoutSupplies.username} doesn't have enough supplies`;
	}

	for (const user of users) {
		const checkResult = await checkTOBUser(user, isHardMode);
		if (!checkResult[0]) {
			continue;
		} else {
			return checkResult[1];
		}
	}

	return null;
}

function kcEffectiveness(normalKC: number, hardKC: number, hardMode: boolean) {
	const kc = hardMode ? hardKC : normalKC;
	let cap = 400;
	if (hardMode) {
		cap = 100;
	}
	const kcEffectiveness = Math.min(100, calcWhatPercent(kc, cap));
	return kcEffectiveness;
}

const speedReductionForGear = 16;
const speedReductionForKC = 70;
const totalSpeedReductions = speedReductionForGear + speedReductionForKC + 10 + 5;
const baseDuration = Time.Minute * 83;
const baseCmDuration = Time.Minute * 110;

const { ceil } = Math;
function calcPerc(perc: number, num: number) {
	return ceil(calcPercentOfNum(ceil(perc), num));
}

interface ParsedTeamMember {
	id: string;
	kc: number;
	hardKC: number;
	deathChances: TOBDeaths;
	deaths: number[];
}

export async function createTOBTeam({
	team,
	hardMode,
	kcOverride,
	attemptsOverride,
	disableVariation
}: {
	team: KlasaUser[];
	hardMode: boolean;
	kcOverride?: [number, number];
	attemptsOverride?: [number, number];
	disableVariation?: true;
}): Promise<{
	reductions: Record<string, number>;
	duration: number;
	totalReduction: number;
	parsedTeam: ParsedTeamMember[];
	wipedRoom: TOBRoom | null;
	deathDuration: number | null;
}> {
	const teamSize = team.length;
	const minPlayerTime = hardMode ? 25 * Time.Minute : 20 * Time.Minute;
	assert(teamSize > 1 && teamSize < 6, 'TOB team must be 2-5 users');

	let totalReduction = 0;

	let reductions: Record<string, number> = {};

	let parsedTeam: ParsedTeamMember[] = [];

	for (const u of team) {
		const [kc, hardKC] =
			kcOverride ?? (await Promise.all([u.getMinigameScore('tob'), u.getMinigameScore('tob_hard')]));

		const [attempts, hardAttempts] =
			attemptsOverride ??
			(await Promise.all([
				u.settings.get(UserSettings.Stats.TobAttempts),
				u.settings.get(UserSettings.Stats.TobHardModeAttempts)
			]));

		let userPercentChange = 0;

		// Reduce time for gear
		const { total } = calculateTOBUserGearPercents(u);
		userPercentChange += calcPerc(total, speedReductionForGear);

		// Reduce time for KC
		const kcPercent = kcEffectiveness(kc, hardKC, hardMode);
		userPercentChange += calcPerc(kcPercent, speedReductionForKC);
		const maxKcCurveBonus = 30;
		const durationCurveModifier = Math.min(maxKcCurveBonus, kcPercent * 0.6);
		userPercentChange *= 1 + durationCurveModifier / 100;

		/**
		 *
		 * Item/Gear Boosts
		 *
		 */
		const meleeWeaponBoosts = [
			['Scythe of vitur', 15],
			['Blade of saeldor (c)', 6],
			['Abyssal tentacle', 5.5]
		] as const;
		for (const [name, percent] of meleeWeaponBoosts) {
			if (u.getGear('melee').hasEquipped(name)) {
				userPercentChange += percent;
				break;
			}
		}
		const rangeWeaponBoosts = [['Twisted bow', 4]] as const;
		for (const [name, percent] of rangeWeaponBoosts) {
			if (u.getGear('range').hasEquipped(name)) {
				userPercentChange += percent;
				break;
			}
		}

		// Blowpipe
		const darts = u.settings.get(UserSettings.Blowpipe).dartID!;
		const dartItem = getOSItem(darts);
		const dartIndex = blowpipeDarts.indexOf(dartItem);
		const percent = dartIndex >= 3 ? dartIndex * 0.9 : -(4 * (4 - dartIndex));
		userPercentChange += percent;

		const deathChances = calculateTOBDeaths(kc, hardKC, attempts, hardAttempts, hardMode);
		parsedTeam.push({ kc, hardKC, deathChances, deaths: deathChances.deaths, id: u.id });

		let reduction = round(userPercentChange / teamSize, 1);

		totalReduction += reduction;
		reductions[u.id] = reduction;
	}
	let duration = baseDuration;

	if (hardMode) {
		duration = baseCmDuration;
		duration = reduceNumByPercent(duration, totalReduction / 1.3);
	} else {
		duration = reduceNumByPercent(duration, totalReduction);
	}

	duration = Math.max(minPlayerTime, duration);
	if (disableVariation !== true) {
		duration = randomVariation(duration, 5);
	}

	let wipedRoom: TOBRoom | null = null;
	let deathDuration: number | null = 0;
	for (let i = 0; i < TOBRooms.length; i++) {
		let room = TOBRooms[i];
		if (parsedTeam.every(member => member.deaths.includes(i))) {
			wipedRoom = room;
			deathDuration += calcWhatPercent(randInt(1, room.timeWeighting), duration);
		} else {
			deathDuration += calcWhatPercent(room.timeWeighting, duration);
		}
	}

	if (!wipedRoom) deathDuration = null;

	return {
		duration,
		reductions,
		totalReduction: totalSpeedReductions / teamSize,
		parsedTeam,
		wipedRoom,
		deathDuration
	};
}

export async function calcTOBInput(u: KlasaUser) {
	const items = new Bank();
	const kc = await u.getMinigameScore('tob');
	items.add('Stamina potion(4)', 1);
	items.add('Super combat potion(4)', 1);
	items.add('Ranging potion(4)', 1);

	let brewsNeeded = Math.max(2, 8 - Math.max(1, Math.ceil((kc + 1) / 30)));
	const restoresNeeded = Math.max(2, Math.floor(brewsNeeded / 3));
	if (kc < 20) {
		items.add('Shark', 3);
		items.add('Cooked karambwan', 3);
	}

	items.add('Saradomin brew(4)', brewsNeeded);
	items.add('Super restore(4)', restoresNeeded);

	items.add('Blood rune', 110);
	items.add('Death rune', 100);
	items.add('Water rune', 800);

	if (u.getGear('melee').hasEquipped('Scythe of vitur')) {
		items.add('Blood rune', 600);
		items.add('Vial of blood', 2);
	}

	return items;
}
