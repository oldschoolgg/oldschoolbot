import { channelIsSendable, formatOrdinal, mentionCommand } from '@oldschoolgg/toolkit';
import { bold } from 'discord.js';
import { calcPercentOfNum, clamp, percentChance, randArrItem, randInt, reduceNumByPercent, Time } from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { UniqueTable } from 'oldschooljs/dist/simulation/clues/Beginner';

import { mahojiParseNumber, userStatsBankUpdate } from '../mahoji/mahojiSettings';
import { Emoji } from './constants';
import { calcSetupPercent } from './data/cox';
import { getSimilarItems } from './data/similarItems';
import { degradeItem } from './degradeableItems';
import { UserFullGearSetup } from './gear';
import { trackLoot } from './lootTrack';
import { setupParty } from './party';
import { getMinigameScore } from './settings/minigames';
import { Gear } from './structures/Gear';
import { ItemBank, MakePartyOptions, Skills } from './types';
import { DOAOptions, DOAStoredRaid } from './types/minions';
import { bankToStrShortNames, formatDuration, formatSkillRequirements, itemID, itemNameFromID } from './util';
import addSubTaskToActivityTask from './util/addSubTaskToActivityTask';
import { calcMaxTripLength } from './util/calcMaxTripLength';
import getOSItem from './util/getOSItem';
import resolveItems from './util/resolveItems';
import { updateBankSetting } from './util/updateBankSetting';

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
	'Saradomin brew(4)': 10,
	'Super restore(4)': 5,
	'Ranging potion(4)': 1,
	'Super combat potion(4)': 1,
	'Magic potion(4)': 1
});

export const maxMage = new Gear({
	head: 'Gorajan occult helmet',
	neck: 'Arcane blast necklace',
	body: 'Gorajan occult top',
	cape: 'Imbued saradomin cape',
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
	cape: "Ava's assembler",
	hands: 'Gorajan archer gloves',
	legs: 'Gorajan archer legs',
	feet: 'Gorajan archer boots',
	'2h': 'Titan ballista',
	ring: 'Lightbearer',
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
	'2h': 'Atlantian trident'
});

const REQUIRED_MELEE_WEAPONS = resolveItems(['Piercing trident', 'Atlantian trident']);
const REQUIRED_MAGE_WEAPONS = resolveItems(['Void staff', "Tumeken's shadow"]);
const REQUIRED_RANGE_WEAPONS = resolveItems(['Heavy ballista', 'Titan ballista']);
const VOID_STAFF_CHARGES_PER_RAID = 30;
const TUMEKEN_SHADOW_PER_RAID = 150;
const JAVELLINS_PER_RAID = 100;
const JAVELLINS = resolveItems(['Amethyst javelin', 'Dragon javelin', 'Obsidian javelin']);
const BP_DARTS_NEEDED = 150;
const SANG_BLOOD_RUNES_PER_RAID = 200;

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
			const arrowsNeeded = JAVELLINS_PER_RAID * quantity;

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
		doesMeet: ({ user }) => {
			if (!user.bank.has('Sanguinesti staff')) {
				return 'You need a Sanguinesti staff in your bank';
			}

			if (user.bank.amount('Blood rune') < SANG_BLOOD_RUNES_PER_RAID) {
				return `You need atleast ${SANG_BLOOD_RUNES_PER_RAID} Blood runes in your bank to charge your Sanguinesti staff`;
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
			let addition = 0;
			return addition;
		},
		baseTime: Time.Minute * 10,
		speedBoosts: []
	},
	{
		id: 2,
		name: 'Steelmaw the Whale',
		addedDeathChance: (_user: MUser) => {
			let addition = 0;
			return addition;
		},
		baseTime: Time.Minute * 25,
		speedBoosts: [
			{
				name: 'Titan ballista',
				percent: 20,
				has: user => user.gear.range.hasEquipped('Titan ballista')
			},
			{
				name: 'Obsidian javelins',
				percent: 20,
				has: user => user.gear.range.hasEquipped('Obsidian javelin')
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
		baseTime: Time.Minute * 25,
		speedBoosts: [
			{
				name: 'Atlantean trident',
				percent: 10,
				has: user => user.gear.melee.hasEquipped('Atlantean trident')
			}
		]
	},
	{
		id: 4,
		name: "Thalassar the Ocean's Warden",
		addedDeathChance: (_user: MUser) => {
			let addition = 0;
			return addition;
		},
		baseTime: Time.Minute * 15,
		speedBoosts: [
			{
				name: 'Atlantean trident',
				percent: 10,
				has: user => user.gear.melee.hasEquipped('Atlantean trident')
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
}): Promise<{
	cost: Bank;
	blowpipeCost: Bank;
}> {
	const cost = new Bank();
	const kc =
		kcOverride ?? (await getMinigameScore(user.id, challengeMode ? 'depths_of_atlantis' : 'depths_of_atlantis_cm'));
	cost.add('Super combat potion(4)', quantity);
	cost.add('Ranging potion(4)', quantity);
	cost.add('Sanfew serum(4)', quantity);

	// Between 8-1 brews
	let brewsNeeded = Math.max(1, 9 - Math.max(1, Math.ceil((kc + 1) / 12)));
	let restoresNeeded = Math.max(2, Math.floor(brewsNeeded / 3));

	cost.add('Saradomin brew(4)', brewsNeeded * quantity);
	cost.add('Super restore(4)', restoresNeeded * quantity);
	cost.add('Blood rune', SANG_BLOOD_RUNES_PER_RAID * quantity);
	cost.add('Enhanced stamina potion', quantity);

	const rangeWeapon = user.gear.range.equippedWeapon();
	if (!rangeWeapon) {
		throw new Error(`${user.logName} had no range weapon for DOA`);
	}

	const { blowpipe } = user;
	const dartID = blowpipe.dartID ?? itemID('Rune dart');
	const dartQuantity = blowpipe.dartQuantity ?? BP_DARTS_NEEDED;
	const blowpipeCost = new Bank();
	blowpipeCost.add(dartID, Math.floor(Math.min(dartQuantity, BP_DARTS_NEEDED)) * quantity);

	return {
		cost,
		blowpipeCost
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
		const missedBoosts: string[] = [];
		const deathsPerUser = new Map<string, number[]>();
		for (const user of team) deathsPerUser.set(user.user.id, []);
		messages.push(`Simulating ${formatOrdinal(i + 1)} raid`);

		for (const room of DOARooms) {
			let deaths = 0;
			let roomTime = room.baseTime;

			for (const { user, roomKCs } of team) {
				messages.push(`  Checking boosts for ${user.usernameOrMention}`);
				for (const boost of room.speedBoosts) {
					let percent = boost.percent / team.length;
					let actualDecrease = calcPercentOfNum(percent, roomTime);
					if (boost.has(user)) {
						roomTime -= reduceNumByPercent(roomTime, percent);
						messages.push(
							`    ${user.usernameOrMention} ${boost.name} boost removed ${formatDuration(
								actualDecrease
							)}`
						);
					} else {
						missedBoosts.push(`${user.usernameOrMention} missed the ${boost.name} boost`);
						messages.push(
							`    ${user.usernameOrMention} missed the ${
								boost.name
							} boost, it wouldve saved ${formatDuration(actualDecrease)}`
						);
					}
				}

				messages.push(`  Calculating death chance for ${user.usernameOrMention} in ${room.name} room...`);
				let baseDeathChance = getPercentage(roomKCs[room.id]);
				messages.push(`    Base chance of ${baseDeathChance}% chance`);
				if (challengeMode) {
					baseDeathChance *= 1.5;
					messages.push(`    Multiplied by 1.5x because challenge mode, now ${baseDeathChance}%`);
				}
				const addedDeathChance = room.addedDeathChance(user);
				if (addedDeathChance !== 0) {
					messages.push(`    Had an extra ${addedDeathChance}% added because of one of the rooms mechanics`);
				}
				let deathChanceForThisUserRoom = clamp(baseDeathChance + addedDeathChance, 5, 99);
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

			// Wiped
			if (deaths === team.length) {
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

export async function doaStartCommand(
	user: MUser,
	challengeMode: boolean,
	solo: boolean,
	channelID: string,
	teamSize: number | undefined,
	quantityInput: number | undefined
): CommandResponse {
	if (user.minionIsBusy) {
		return `${user.usernameOrMention} minion is busy`;
	}

	const initialCheck = await checkDOAUser({
		user,
		challengeMode,
		duration: Time.Hour,
		quantity: 1
	});
	if (typeof initialCheck === 'string') {
		return initialCheck;
	}

	if (user.minionIsBusy) {
		return "Your minion is busy, so you can't start a raid.";
	}

	let maxSize = mahojiParseNumber({ input: teamSize, min: 2, max: 8 }) ?? 8;

	const partyOptions: MakePartyOptions = {
		leader: user,
		minSize: 1,
		maxSize,
		ironmanAllowed: true,
		message: `${user.usernameOrMention} is hosting a Depths of Atlantis mass! Use the buttons below to join/leave.`,
		customDenier: async checkUser => {
			const checkResult = await checkDOAUser({
				user: checkUser,
				challengeMode,
				duration: Time.Hour,
				quantity: 1
			});
			if (typeof checkResult === 'string') {
				return [true, checkResult];
			}

			return [false];
		}
	};

	const channel = globalClient.channels.cache.get(channelID);
	if (!channelIsSendable(channel)) return 'No channel found.';

	let usersWhoConfirmed = [];
	try {
		usersWhoConfirmed = solo ? [user] : await setupParty(channel, user, partyOptions);
	} catch (err: any) {
		return {
			content: typeof err === 'string' ? err : 'Your mass failed to start.',
			ephemeral: true
		};
	}
	const users = usersWhoConfirmed.filter(u => !u.minionIsBusy).slice(0, maxSize);

	const teamCheck = await checkDOATeam(users, challengeMode, 1);
	if (typeof teamCheck === 'string') {
		return {
			content: `Your mass failed to start because of this reason: ${teamCheck} ${users}`,
			allowedMentions: {
				users: users.map(i => i.id)
			}
		};
	}

	const baseDuration = createDOATeam({
		team: teamCheck,
		quantity: 1,
		challengeMode
	}).fakeDuration;
	const maxTripLength = Math.max(...users.map(i => calcMaxTripLength(i, 'DepthsOfAtlantis')));
	const maxQuantity = clamp(Math.floor(maxTripLength / baseDuration), 1, 5);
	const quantity = clamp(quantityInput ?? maxQuantity, 1, maxQuantity);

	const createdDOATeam = createDOATeam({
		team: teamCheck,
		quantity,
		challengeMode
	});

	let debugStr = '';

	const totalCost = new Bank();

	const costResult = await Promise.all(
		users.map(async u => {
			const { cost, blowpipeCost } = await calcDOAInput({
				user: u,
				duration: createdDOATeam.fakeDuration,
				quantity,
				challengeMode
			});
			const { realCost } = await u.specialRemoveItems(cost.clone().add(blowpipeCost));

			if (user.gear.mage.hasEquipped('Void staff')) {
				await degradeItem({
					item: getOSItem('Void staff'),
					chargesToDegrade: VOID_STAFF_CHARGES_PER_RAID * quantity,
					user: u
				});
			} else if (u.gear.mage.hasEquipped("Tumeken's shadow")) {
				await degradeItem({
					item: getOSItem("Tumeken's shadow"),
					chargesToDegrade: TUMEKEN_SHADOW_PER_RAID * quantity,
					user: u
				});
			} else {
				throw new Error('No staff equipped');
			}
			await userStatsBankUpdate(u.id, 'doa_cost', realCost);
			const effectiveCost = realCost.clone();
			totalCost.add(effectiveCost);

			const { total } = calculateUserGearPercents(u.gear);

			const gearMarker = users.length > 5 ? 'Gear: ' : Emoji.Gear;
			const boostsMarker = users.length > 5 ? 'Boosts: ' : Emoji.CombatSword;
			debugStr += `**- ${u.usernameOrMention}** ${gearMarker}${total.toFixed(
				1
			)}% ${boostsMarker} used ${bankToStrShortNames(realCost)}\n\n`;
			return {
				userID: u.id,
				effectiveCost
			};
		})
	);

	await updateBankSetting('doa_cost', totalCost);
	await trackLoot({
		totalCost,
		id: 'depths_of_atlantis',
		type: 'Minigame',
		changeType: 'cost',
		users: costResult.map(i => ({
			id: i.userID,
			cost: i.effectiveCost,
			duration: createdDOATeam.realDuration
		}))
	});
	await addSubTaskToActivityTask<DOAOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		duration: createdDOATeam.realDuration,
		type: 'DepthsOfAtlantis',
		leader: user.id,
		users: users.map(i => i.id),
		fakeDuration: createdDOATeam.fakeDuration,
		quantity,
		cm: challengeMode,
		raids: createdDOATeam.raids
	});

	let str = `${partyOptions.leader.usernameOrMention}'s party (${users
		.map(u => u.usernameOrMention)
		.join(', ')}) is now off to do ${
		quantity === 1 ? 'a' : `${quantity}x`
	} Depths of Atlantis raid - the total trip will take ${formatDuration(createdDOATeam.fakeDuration)}.`;

	str += ` \n\n${debugStr}`;

	if (createdDOATeam.results[0].messages.length > 0) {
		// str += `\n**Message:** ${createdDOATeam.results[0].messages.join(',')}`;
		return {
			content: str,
			files: [{ attachment: Buffer.from(createdDOATeam.results[0].messages.join('\n')), name: 'doa.txt' }]
		};
	}

	return str;
}

export async function doaCheckCommand(user: MUser) {
	const result = await checkDOAUser({ user, challengeMode: false, duration: Time.Hour, quantity: 1 });
	if (typeof result === 'string') {
		return `🔴 You aren't able to join a Tombs of Amascut raid, address these issues first: ${result[1]}`;
	}

	return `✅ You are ready to do the Depths of Atlantis! Start a raid: ${mentionCommand(
		globalClient,
		'raid',
		'doa',
		'start'
	)}`;
}

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
	for (const item of UniqueTable.allItems) {
		totalUniques += user.cl.amount(item);
	}

	const minigameStats = await user.fetchMinigames();

	let str = `**Depths of Atlantis** 

**Attempts:** 

${DOARooms.map(i => `- ${i.name}: ${(stats.doa_room_attempts_bank as ItemBank)[i.id] ?? 0} KC`).join('\n')}

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
		let res = i.doesMeet({ user, gearStats, quantity: 1, allItemsOwned: user.allItemsOwned });
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
	let base = 40 - clamp(teamSize, 1, 3);
	if (cm) base -= 3;
	return base;
}

const uniques = resolveItems(['Oceanic relic', 'Aquifer aegis', 'Shark jaw']);

export function pickUniqueToGiveUser(cl: Bank) {
	const unownedUniques = uniques.filter(i => !cl.has(i));
	if (unownedUniques.length > 0) {
		return randArrItem(unownedUniques);
	}
	return randArrItem(uniques);
}
