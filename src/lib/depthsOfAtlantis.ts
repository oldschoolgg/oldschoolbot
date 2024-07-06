import { formatOrdinal, mentionCommand } from '@oldschoolgg/toolkit';
import { bold } from 'discord.js';
import {
	Time,
	calcPercentOfNum,
	clamp,
	increaseNumByPercent,
	percentChance,
	randArrItem,
	randInt,
	reduceNumByPercent
} from 'e';
import { Bank } from 'oldschooljs';

import { calcSetupPercent } from './data/cox';
import { getSimilarItems } from './data/similarItems';
import type { UserFullGearSetup } from './gear';
import { getMinigameScore } from './settings/minigames';
import { Gear } from './structures/Gear';
import type { ItemBank, Skills } from './types';
import type { DOAStoredRaid } from './types/minions';
import { formatDuration, formatSkillRequirements, itemID, itemNameFromID } from './util';
import resolveItems from './util/resolveItems';

const { floor } = Math;

const minDOAStats: Skills = {
	attack: 110,
	strength: 110,
	defence: 110,
	magic: 110,
	prayer: 110,
	ranged: 110
};

interface GearSetupPercents {
	melee: number;
	range: number;
	mage: number;
	total: number;
}

const minimumSuppliesNeeded = new Bank({
	'Saradomin brew(4)': 22,
	'Super restore(4)': 15,
	'Ranging potion(4)': 2,
	'Super combat potion(4)': 2,
	'Magic potion(4)': 2
});

export const maxMage = new Gear({
	head: 'Gorajan occult helmet',
	neck: 'Arcane blast necklace',
	body: 'Gorajan occult top',
	cape: 'Vasa cloak',
	hands: 'Gorajan occult gloves',
	legs: 'Gorajan occult legs',
	feet: 'Gorajan occult boots',
	weapon: 'Void staff',
	ring: 'Lightbearer',
	shield: 'Abyssal tome'
});

export const maxRange = new Gear({
	head: 'Gorajan archer helmet',
	neck: 'Farsight snapshot necklace',
	body: 'Gorajan archer top',
	cape: 'Tidal collector',
	hands: 'Gorajan archer gloves',
	legs: 'Gorajan archer legs',
	feet: 'Gorajan archer boots',
	'2h': 'Titan ballista',
	ring: 'Ring of piercing (i)',
	ammo: 'Obsidian javelin'
});
maxRange.ammo!.quantity = 100_000;

export const maxMelee = new Gear({
	cape: 'Tzkal cape',
	ring: 'Ignis ring(i)',
	head: 'Gorajan warrior helmet',
	neck: "Brawler's hook necklace",
	body: 'Gorajan warrior top',
	hands: 'Gorajan warrior gloves',
	legs: 'Gorajan warrior legs',
	feet: 'Gorajan warrior boots',
	'2h': 'Atlantean trident'
});

const REQUIRED_MELEE_WEAPONS = resolveItems(['Piercing trident', 'Atlantean trident']);
const REQUIRED_MAGE_WEAPONS = resolveItems(['Void staff', "Tumeken's shadow"]);
const REQUIRED_RANGE_WEAPONS = resolveItems(['Heavy ballista', 'Titan ballista']);
const VOID_STAFF_CHARGES_PER_RAID = 30;
const TUMEKEN_SHADOW_PER_RAID = 150;
const JAVELLINS_PER_RAID = (rangeLevel: number) => {
	if (rangeLevel === 120) return 15;
	if (rangeLevel >= 118) return 16;
	if (rangeLevel >= 116) return 17;
	if (rangeLevel >= 114) return 18;
	if (rangeLevel >= 112) return 19;
	return 20;
};
const JAVELLINS = resolveItems(['Amethyst javelin', 'Dragon javelin', 'Obsidian javelin']);
const SANG_CHARGES_PER_RAID = 500;

const requirements: {
	name: string;
	doesMeet: (options: {
		user: MUser;
		quantity: number;
		allItemsOwned: Bank;
		gearStats: GearSetupPercents;
	}) => string | true;
	desc: () => string;
}[] = [
	{
		name: 'Range gear',
		doesMeet: ({ user, gearStats, quantity }) => {
			if (gearStats.range < 25) {
				return 'Terrible range gear';
			}

			if (!user.gear.range.hasEquipped(REQUIRED_RANGE_WEAPONS, false)) {
				return `Must have one of these equipped: ${REQUIRED_RANGE_WEAPONS.map(itemNameFromID).join(', ')}`;
			}

			const rangeAmmo = user.gear.range.ammo;
			const arrowsNeeded = JAVELLINS_PER_RAID(user.skillsAsLevels.ranged) * quantity;

			if (!rangeAmmo || !rangeAmmo.item || !JAVELLINS.includes(rangeAmmo.item)) {
				return `You need to have javellins equipped in your range setup, one of: ${JAVELLINS.map(
					itemNameFromID
				).join(', ')}`;
			}

			if (rangeAmmo.quantity < arrowsNeeded) {
				return `You need atleast ${arrowsNeeded}x ${itemNameFromID(rangeAmmo.item)} in your range setup.`;
			}

			return true;
		},
		desc: () =>
			`decent range gear (BiS is ${maxRange.toString()}), atleast ${JAVELLINS_PER_RAID}x javelins equipped (must be one of ${JAVELLINS.map(
				itemNameFromID
			).join(', ')}), and one of these ballista's: ${REQUIRED_RANGE_WEAPONS.map(itemNameFromID).join(', ')}`
	},
	{
		name: 'Melee gear',
		doesMeet: ({ user, gearStats }) => {
			if (gearStats.melee < 25) {
				return 'Terrible melee gear';
			}

			if (!user.gear.melee.hasEquipped(REQUIRED_MELEE_WEAPONS, false)) {
				return `Need one of these weapons in your melee setup: ${REQUIRED_MELEE_WEAPONS.map(
					itemNameFromID
				).join(', ')}`;
			}

			return true;
		},
		desc: () =>
			`decent melee gear (BiS is ${maxMelee.toString()}, and one of these weapons: ${REQUIRED_MELEE_WEAPONS.map(
				itemNameFromID
			).join(', ')}`
	},
	{
		name: 'Mage gear',
		doesMeet: ({ gearStats, user }) => {
			if (gearStats.mage < 25) {
				return 'Terrible mage gear';
			}

			if (!user.gear.mage.hasEquipped(REQUIRED_MAGE_WEAPONS, false)) {
				return `Need one of these weapons in your mage setup: ${REQUIRED_MAGE_WEAPONS.map(itemNameFromID).join(
					', '
				)}`;
			}

			return true;
		},
		desc: () => `decent mage gear (BiS is ${maxMage.toString()})`
	},
	{
		name: 'Sanguinesti staff',
		doesMeet: ({ user, quantity }) => {
			if (!user.bank.has('Sanguinesti staff')) {
				return 'You need a Sanguinesti staff in your bank';
			}

			if (user.user.sang_charges < SANG_CHARGES_PER_RAID * quantity) {
				return `You need atleast ${SANG_CHARGES_PER_RAID} charges in your Sanguinesti staff per raid`;
			}

			return true;
		},
		desc: () => `decent mage gear (BiS is ${maxMage.toString()})`
	},
	{
		name: 'Stats',
		doesMeet: ({ user }) => {
			if (!user.hasSkillReqs(minDOAStats)) {
				return `You need: ${formatSkillRequirements(minDOAStats)}.`;
			}
			return true;
		},
		desc: () => `${formatSkillRequirements(minDOAStats)}`
	},
	{
		name: 'Supplies',
		doesMeet: ({ user, quantity }) => {
			if (!user.owns(minimumSuppliesNeeded.clone().multiply(quantity))) {
				return `You need atleast this much supplies: ${minimumSuppliesNeeded}`;
			}

			const tumCharges = TUMEKEN_SHADOW_PER_RAID * quantity;
			if (user.gear.mage.hasEquipped("Tumeken's shadow") && user.user.tum_shadow_charges < tumCharges) {
				return `You need atleast ${tumCharges} Tumeken's shadow charges to use it, otherwise it has to be unequipped: ${mentionCommand(
					globalClient,
					'minion',
					'charge'
				)}`;
			}
			const voidStaffCharges = VOID_STAFF_CHARGES_PER_RAID * quantity;
			if (user.gear.mage.hasEquipped('Void staff') && user.user.void_staff_charges < voidStaffCharges) {
				return `You need atleast ${voidStaffCharges} Void staff charges to use it, otherwise it has to be unequipped: ${mentionCommand(
					globalClient,
					'minion',
					'charge'
				)}`;
			}

			return true;
		},
		desc: () => `Need atleast ${minimumSuppliesNeeded}`
	},
	{
		name: 'Rune Pouch',
		doesMeet: ({ allItemsOwned }) => {
			const similarItems = getSimilarItems(itemID('Rune pouch'));
			if (similarItems.every(item => !allItemsOwned.has(item))) {
				return 'You need to own a Rune pouch.';
			}
			return true;
		},
		desc: () => `Need atleast ${minimumSuppliesNeeded}`
	}
];

interface RoomBoost {
	name: string;
	has: (user: MUser) => boolean;
	percent: number;
}

interface AtlantisRoom {
	id: 1 | 2 | 3 | 4;
	name: string;
	addedDeathChance: (user: MUser) => number;
	baseTime: number;
	speedBoosts: RoomBoost[];
}

export const DOARooms: AtlantisRoom[] = [
	{
		id: 1,
		name: 'Shadowcaster the Octopus',
		addedDeathChance: (_user: MUser) => {
			const addition = 0;
			return addition;
		},
		baseTime: Time.Minute * 16,
		speedBoosts: [
			{
				name: 'Void staff',
				percent: 25,
				has: user => user.gear.mage.hasEquipped('Void staff')
			},
			{
				name: 'Imbued heart',
				percent: 7,
				has: user => user.bank.has('Imbued heart')
			},
			{
				name: 'Abyssal tome',
				percent: 7,
				has: user => user.gear.mage.hasEquipped('Abyssal tome')
			},
			{
				name: 'Vasa cloak',
				percent: 7,
				has: user => user.gear.mage.hasEquipped('Vasa cloak')
			},
			{
				name: '120 Fishing',
				percent: 3,
				has: user => user.skillsAsLevels.fishing >= 120
			}
		]
	},
	{
		id: 2,
		name: 'Steelmaw the Whale',
		addedDeathChance: (user: MUser) => {
			let addition = 0;
			if (user.skillsAsLevels.agility < 90) {
				addition += 50;
			}
			return addition;
		},
		baseTime: Time.Minute * 19,
		speedBoosts: [
			{
				name: 'Titan ballista',
				percent: 25,
				has: user => user.gear.range.hasEquipped('Titan ballista')
			},
			{
				name: 'Obsidian javelins',
				percent: 25,
				has: user => user.gear.range.hasEquipped('Obsidian javelin')
			},
			{
				name: 'Ring of piercing',
				percent: 7,
				has: user => user.gear.range.hasEquipped('Ring of piercing')
			},
			{
				name: 'Tidal collector',
				percent: 7,
				has: user => user.gear.range.hasEquipped('Tidal collector')
			},
			{
				name: '120 Fishing',
				percent: 3,
				has: user => user.skillsAsLevels.fishing >= 120
			}
		]
	},
	{
		id: 3,
		name: 'Voidswimmer the Shark',
		addedDeathChance: (user: MUser) => {
			let addition = 0;
			const agilLevel = user.skillsAsLevels.agility;
			if (agilLevel < 50) {
				addition += 100;
			} else if (agilLevel < 90) {
				addition += 30;
			} else if (agilLevel < 100) {
				addition += 10;
			} else if (agilLevel < 110) {
				addition += 5;
			}
			return addition;
		},
		baseTime: Time.Minute * 17,
		speedBoosts: [
			{
				name: 'Atlantean trident',
				percent: 25,
				has: user => user.gear.melee.hasEquipped('Atlantean trident')
			},
			{
				name: '120 Strength',
				percent: 5,
				has: user => user.skillsAsLevels.strength >= 120
			},
			{
				name: '120 Attack',
				percent: 5,
				has: user => user.skillsAsLevels.attack >= 120
			},
			{
				name: 'TzKal cape',
				percent: 9,
				has: user => user.gear.melee.hasEquipped('TzKal cape')
			},
			{
				name: 'Ignis ring',
				percent: 7,
				has: user => user.gear.melee.hasEquipped('Ignis ring')
			},
			{
				name: '120 Fishing',
				percent: 3,
				has: user => user.skillsAsLevels.fishing >= 120
			}
		]
	},
	{
		id: 4,
		name: "Thalassar the Ocean's Warden",
		addedDeathChance: (_user: MUser) => {
			const addition = 0;
			return addition;
		},
		baseTime: Time.Minute * 13,
		speedBoosts: [
			{
				name: 'Atlantean trident',
				percent: 25,
				has: user => user.gear.melee.hasEquipped('Atlantean trident')
			},
			{
				name: '120 Magic',
				percent: 5,
				has: user => user.skillsAsLevels.magic >= 120
			},
			{
				name: '120 Attack',
				percent: 5,
				has: user => user.skillsAsLevels.attack >= 120
			},
			{
				name: '120 Agility',
				percent: 5,
				has: user => user.skillsAsLevels.agility >= 120
			},
			{
				name: '120 Fishing',
				percent: 3,
				has: user => user.skillsAsLevels.fishing >= 120
			}
		]
	}
];

export async function calcDOAInput({
	user,
	kcOverride,
	quantity,
	challengeMode
}: {
	user: MUser;
	kcOverride?: number;
	duration: number;
	quantity: number;
	challengeMode: boolean;
}) {
	const cost = new Bank();
	const kc =
		kcOverride ?? (await getMinigameScore(user.id, challengeMode ? 'depths_of_atlantis' : 'depths_of_atlantis_cm'));
	cost.add('Super combat potion(4)', quantity);
	cost.add('Ranging potion(4)', quantity);
	cost.add('Sanfew serum(4)', quantity);

	if (!user.owns('Saturated heart') && !user.owns('Imbued heart')) {
		cost.add('Magic potion(4)', quantity);
	}

	let brewsNeeded = Math.max(4, 9 - Math.max(1, Math.ceil((kc + 1) / 12)));
	brewsNeeded += 10;
	const restoresNeeded = Math.max(2, Math.floor(brewsNeeded / 3));

	cost.add('Saradomin brew(4)', brewsNeeded * quantity);
	cost.add('Super restore(4)', restoresNeeded * quantity);
	cost.add('Enhanced stamina potion', quantity);

	let effectiveSangChargesPerRaid = SANG_CHARGES_PER_RAID;
	const octopusRoom = DOARooms[0];
	for (const boost of octopusRoom.speedBoosts) {
		if (boost.has(user)) {
			effectiveSangChargesPerRaid = reduceNumByPercent(effectiveSangChargesPerRaid, boost.percent);
		}
	}

	let sangCharges = effectiveSangChargesPerRaid * quantity;

	let voidStaffCharges = null;
	let tumShadowCharges = null;

	if (user.gear.mage.hasEquipped('Void staff')) {
		voidStaffCharges = VOID_STAFF_CHARGES_PER_RAID * quantity;
	} else if (user.gear.mage.hasEquipped("Tumeken's shadow")) {
		tumShadowCharges = TUMEKEN_SHADOW_PER_RAID * quantity;
	} else {
		throw new Error(`${user.logName} has no mage weapon for DOA`);
	}

	if (challengeMode) {
		cost.add('Enhanced stamina potion', quantity);
		cost.add('Saradomin brew(4)', 4 * quantity);
		cost.add('Super restore(4)', quantity);
		sangCharges += 30 * quantity;
		if (voidStaffCharges) voidStaffCharges = floor(increaseNumByPercent(voidStaffCharges, 20));
		if (tumShadowCharges) tumShadowCharges = floor(increaseNumByPercent(tumShadowCharges, 20));
	}

	const rangeWeapon = user.gear.range.equippedWeapon();
	if (!rangeWeapon) {
		throw new Error(`${user.logName} had no range weapon for DOA`);
	}

	const rangeAmmo = user.gear.range.ammo;
	if (!rangeAmmo || !JAVELLINS.includes(rangeAmmo.item)) {
		throw new Error(`${user.logName} had no javellins for DOA`);
	}
	cost.add(rangeAmmo.item, JAVELLINS_PER_RAID(user.skillsAsLevels.ranged) * quantity);

	return {
		cost,
		sangCharges: floor(sangCharges),
		voidStaffCharges,
		tumShadowCharges
	};
}

type CheckedDOAUser = Exclude<Awaited<ReturnType<typeof checkDOAUser>>, string>;

export async function checkDOAUser({
	user,
	challengeMode,
	duration,
	quantity
}: {
	user: MUser;
	challengeMode: boolean;
	duration: number;
	quantity: number;
}) {
	if (!user.hasMinion) {
		return `${user.usernameOrMention} doesn't have a minion`;
	}
	if (user.minionIsBusy) {
		return `${user.usernameOrMention}'s minion is busy`;
	}

	const setupPercents = calculateUserGearPercents(user.gear);
	const reqResults = requirements.map(i => ({
		...i,
		result: i.doesMeet({ user, gearStats: setupPercents, allItemsOwned: user.allItemsOwned, quantity })
	}));
	const unmetReqs = reqResults.filter(i => typeof i.result === 'string');
	if (unmetReqs.length > 0) {
		return `${user.usernameOrMention} doesn't meet the requirements: ${unmetReqs.map(i => i.result).join(', ')}`;
	}

	const { cost } = await calcDOAInput({ user, duration, quantity, challengeMode });
	if (!user.owns(cost, { includeGear: true })) {
		return `${user.usernameOrMention} doesn't own the required supplies: ${cost.remove(user.bankWithGP)}`;
	}

	const kc = await getMinigameScore(user.id, challengeMode ? 'depths_of_atlantis_cm' : 'depths_of_atlantis');

	const userStats = await user.fetchStats({ doa_attempts: true, doa_room_attempts_bank: true });

	const kcBank = userStats.doa_room_attempts_bank as ItemBank;
	const roomKCs = {
		1: kcBank[1] ?? 0,
		2: kcBank[2] ?? 0,
		3: kcBank[3] ?? 0,
		4: kcBank[4] ?? 0
	};

	return {
		kc,
		attempts: userStats.doa_attempts,
		roomKCs,
		user
	};
}

export function calculateUserGearPercents(gear: UserFullGearSetup): GearSetupPercents {
	const melee = calcSetupPercent(
		maxMelee.stats,
		gear.melee.stats,
		'melee_strength',
		['attack_stab', 'attack_slash', 'attack_crush', 'attack_ranged', 'attack_magic'],
		true
	);
	const range = calcSetupPercent(
		maxRange.stats,
		gear.range.stats,
		'ranged_strength',
		['attack_stab', 'attack_slash', 'attack_crush', 'attack_magic'],
		false
	);
	const mage = calcSetupPercent(
		maxMage.stats,
		gear.mage.stats,
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

function getPercentage(kc: number) {
	const maxPercentage = 95;
	const minPercentage = 30;
	const scaleFactor = 3.5;

	const percentage = maxPercentage - (maxPercentage - minPercentage) * Math.log10(1 + kc / scaleFactor);

	return Math.max(0, Math.min(100, percentage));
}

export function createDOATeam({
	team,
	challengeMode,
	quantity
}: {
	team: CheckedDOAUser[];
	challengeMode: boolean;
	quantity: number;
}) {
	let realDuration = 0;
	let fakeDuration = 0;
	const results = [];
	const raids: DOAStoredRaid[] = [];
	const messages: string[] = [];

	for (let i = 0; i < quantity; i++) {
		let wipedRoom = null;
		const deathsPerUser = new Map<string, number[]>();
		for (const user of team) deathsPerUser.set(user.user.id, []);
		messages.push(`Simulating ${formatOrdinal(i + 1)} raid`);

		for (const room of DOARooms) {
			let deaths = 0;
			let roomTime = room.baseTime;

			const cappedTeamSize = clamp(team.length, 1, 5);
			if (cappedTeamSize > 1) {
				roomTime = reduceNumByPercent(roomTime, cappedTeamSize * 2.25);
			}

			for (const { user, roomKCs } of team) {
				messages.push(`  Checking boosts for ${user.usernameOrMention}`);
				for (const boost of room.speedBoosts) {
					const percent = boost.percent / team.length;
					const actualDecrease = calcPercentOfNum(percent, roomTime);
					if (boost.has(user)) {
						roomTime -= actualDecrease;
						messages.push(
							`    ${user.usernameOrMention} ${percent}% ${boost.name} boost removed ${formatDuration(
								actualDecrease
							)}`
						);
					} else {
						messages.push(
							`    ${user.usernameOrMention} missed the ${
								boost.name
							} boost, it would've saved ${formatDuration(actualDecrease)}`
						);
					}
				}

				messages.push(`  Calculating death chance for ${user.usernameOrMention} in ${room.name} room...`);
				let baseDeathChance = getPercentage(roomKCs[room.id]);
				messages.push(`    Base chance of ${baseDeathChance}% chance`);

				if (challengeMode) {
					baseDeathChance *= 2;
					messages.push(`    Base death chance increasing to ${baseDeathChance}% because CM`);
				}

				if (challengeMode) {
					baseDeathChance *= 1.5;
					messages.push(`    Multiplied by 1.5x because challenge mode, now ${baseDeathChance}%`);
				}
				const addedDeathChance = room.addedDeathChance(user);
				if (addedDeathChance !== 0) {
					messages.push(`    Had an extra ${addedDeathChance}% added because of one of the rooms mechanics`);
				}
				const deathChanceForThisUserRoom = clamp(baseDeathChance + addedDeathChance, 2, 99);
				messages.push(
					`    Final death chance for ${user.usernameOrMention} in ${room.name} room: ${deathChanceForThisUserRoom}%`
				);
				if (percentChance(deathChanceForThisUserRoom)) {
					deaths++;
					deathsPerUser.get(user.id)!.push(room.id);
					messages.push(`    ${user.usernameOrMention} died in ${room.name} room`);
				}
				messages.push('');
			}

			fakeDuration += roomTime;

			// Wipe if half of the team dies
			if (deaths >= Math.ceil((team.length + 1) / 2)) {
				wipedRoom = room.id;
				realDuration += randInt(1, roomTime);
				if (!wipedRoom) messages.push(`  Wiped in ${room.name} room`);
			} else {
				realDuration += roomTime;
			}
			messages.push('');
		}

		results.push({
			wipedRoom,
			messages
		});
		raids.push({
			wipedRoom,
			users: team.map(u => ({
				deaths: deathsPerUser.get(u.user.id)!
			}))
		});
	}

	messages.push('');

	return { realDuration, fakeDuration, results, raids };
}

export async function checkDOATeam(users: MUser[], challengeMode: boolean, quantity: number) {
	const userWithoutSupplies = users.find(u => !u.bank.has(minimumSuppliesNeeded));
	if (userWithoutSupplies) {
		return `${userWithoutSupplies.usernameOrMention} doesn't have enough supplies, they need at least ${minimumSuppliesNeeded}.`;
	}
	if (users.length < 1 || users.length > 8) {
		return 'Team must be 1-8 users';
	}

	const checkedUsers: CheckedDOAUser[] = [];

	for (const user of users) {
		if (user.minionIsBusy) return `${user.usernameOrMention}'s minion is busy.`;
		const checkResult = await checkDOAUser({ user, challengeMode, duration: Time.Hour, quantity });
		if (typeof checkResult === 'string') {
			return checkResult;
		}
		checkedUsers.push(checkResult);
	}

	return checkedUsers;
}

export async function doaCheckCommand(user: MUser) {
	const result = await checkDOAUser({ user, challengeMode: false, duration: Time.Hour, quantity: 1 });
	if (typeof result === 'string') {
		return `🔴 You aren't able to join a Depths of Atlantis raid, address these issues first: ${result}`;
	}

	return `✅ You are ready to do the Depths of Atlantis! Start a raid: ${mentionCommand(
		globalClient,
		'raid',
		'doa',
		'start'
	)}`;
}
const uniques = resolveItems(['Oceanic relic', 'Aquifer aegis', 'Shark jaw']);

export async function doaHelpCommand(user: MUser) {
	const gearStats = calculateUserGearPercents(user.gear);
	const stats = await user.fetchStats({
		doa_attempts: true,
		doa_cost: true,
		doa_loot: true,
		doa_room_attempts_bank: true,
		doa_total_minutes_raided: true
	});

	let totalUniques = 0;
	for (const item of uniques) {
		totalUniques += user.cl.amount(item);
	}

	const minigameStats = await user.fetchMinigames();

	const str = `**Depths of Atlantis**

**Attempts:**
${DOARooms.map(i => `- ${i.name}: ${(stats.doa_room_attempts_bank as ItemBank)[i.id] ?? 0} Attempts`).join('\n')}

**KC**: ${minigameStats.depths_of_atlantis} KC
**Challenge Mode KC:** ${minigameStats.depths_of_atlantis_cm} KC
**Total Uniques:** ${totalUniques} ${
		totalUniques > 0
			? `(one unique every ${Math.floor(
					(minigameStats.depths_of_atlantis + minigameStats.depths_of_atlantis_cm) / totalUniques
				)} raids, one unique every ${formatDuration(
					(stats.doa_total_minutes_raided * Time.Minute) / totalUniques
				)})`
			: ''
	}

**Requirements**
${requirements
	.map(i => {
		const res = i.doesMeet({ user, gearStats, quantity: 1, allItemsOwned: user.allItemsOwned });
		if (typeof res === 'string') {
			return `- ❌ ${bold(i.name)} ${res}`;
		}

		return `- ✅ ${bold(i.name)}`;
	})
	.join('\n')}

**Ready:** ${await doaCheckCommand(user)}
`;

	return str;
}

export function chanceOfDOAUnique(teamSize: number, cm: boolean) {
	let base = 100 - clamp(teamSize, 1, 5) * 5;
	if (cm) base = Math.floor(reduceNumByPercent(base, 20));
	return base;
}

export function pickUniqueToGiveUser(cl: Bank) {
	const unownedUniques = uniques.filter(i => !cl.has(i));
	if (unownedUniques.length > 0) {
		return randArrItem(unownedUniques);
	}
	return randArrItem(uniques);
}
