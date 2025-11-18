import type { ButtonBuilder } from '@oldschoolgg/discord';
import { percentChance, randInt, roll } from '@oldschoolgg/rng';
import { formatDuration, SimpleTable, Time } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';

import type { activity_type_enum } from '@/prisma/main/enums.js';
import type { ShootingStars } from '@/prisma/main.js';
import addSkillingClueToLoot from '@/lib/minions/functions/addSkillingClueToLoot.js';
import type { Star } from '@/lib/minions/types.js';
import { determineMiningTime } from '@/lib/skilling/functions/determineMiningTime.js';
import { pickaxes } from '@/lib/skilling/functions/miningBoosts.js';
import type { ActivityTaskData, ShootingStarsOptions } from '@/lib/types/minions.js';
import { makeShootingStarButton } from '@/lib/util/interactions.js';

export const starSizes: Star[] = [
	{
		size: 9,
		level: 90,
		id: 25_527,
		name: 'Star 9',
		respawnTime: 1,
		bankingTime: 0,
		slope: 0.01,
		intercept: 6,
		chance: 3,
		dustAvailable: 15,
		additionalDustPercent: 90,
		xp: 244,
		petChance: 87_840,
		clueScrollChance: 87_840
	},
	{
		size: 8,
		level: 80,
		id: 25_527,
		name: 'Star 8',
		respawnTime: 1,
		bankingTime: 0,
		slope: 0.03,
		intercept: 7,
		chance: 5,
		dustAvailable: 40,
		additionalDustPercent: 72,
		xp: 162,
		petChance: 118_035,
		clueScrollChance: 118_035
	},
	{
		size: 7,
		level: 70,
		id: 25_527,
		name: 'Star 7',
		respawnTime: 1,
		bankingTime: 0,
		slope: 0.04,
		intercept: 9,
		chance: 9,
		dustAvailable: 40,
		additionalDustPercent: 56,
		xp: 123,
		petChance: 148_230,
		clueScrollChance: 148_230
	},
	{
		size: 6,
		level: 60,
		id: 25_527,
		name: 'Star 6',
		respawnTime: 1,
		bankingTime: 0,
		slope: 0.051,
		intercept: 15,
		chance: 12,
		dustAvailable: 80,
		additionalDustPercent: 42,
		xp: 74,
		petChance: 244_305,
		clueScrollChance: 244_305
	},
	{
		size: 5,
		level: 50,
		id: 25_527,
		name: 'Star 5',
		respawnTime: 1,
		bankingTime: 0,
		slope: 0.071,
		intercept: 22.9,
		chance: 17,
		dustAvailable: 175,
		additionalDustPercent: 30,
		xp: 48,
		petChance: 373_320,
		clueScrollChance: 373_320
	},
	{
		size: 4,
		level: 40,
		id: 25_527,
		name: 'Star 4',
		respawnTime: 1,
		bankingTime: 0,
		slope: 0.143,
		intercept: 29.9,
		chance: 20,
		dustAvailable: 300,
		additionalDustPercent: 20,
		xp: 31,
		petChance: 521_550,
		clueScrollChance: 521_550
	},
	{
		size: 3,
		level: 30,
		id: 25_527,
		name: 'Star 3',
		respawnTime: 1,
		bankingTime: 0,
		slope: 0.194,
		intercept: 29.8,
		chance: 18,
		dustAvailable: 430,
		additionalDustPercent: 12,
		xp: 26,
		petChance: 554_490,
		clueScrollChance: 554_490
	},
	{
		size: 2,
		level: 20,
		id: 25_527,
		name: 'Star 2',
		respawnTime: 1,
		bankingTime: 0,
		slope: 0.276,
		intercept: 29.7,
		chance: 16,
		dustAvailable: 700,
		additionalDustPercent: 6,
		xp: 22,
		petChance: 609_390,
		clueScrollChance: 609_390
	},
	{
		size: 1,
		level: 10,
		id: 25_527,
		name: 'Star 1',
		respawnTime: 1,
		bankingTime: 0,
		slope: 0.714,
		intercept: 29.3,
		chance: 0,
		dustAvailable: 1200,
		additionalDustPercent: 2,
		xp: 12,
		petChance: 911_340,
		clueScrollChance: 911_340
	}
];

export async function shootingStarsCommand(
	channelId: string,
	user: MUser,
	_star: ShootingStars | Star
): Promise<string> {
	const skills = user.skillsAsLevels;
	const boosts = [];
	const star: Star = ('dustAvailable' in _star ? _star : starSizes.find(s => s.size === _star.size))!;

	let miningLevel = skills.mining;

	if (skills.mining < star.level) {
		return `${user.minionName} needs ${star.level} Mining to mine a Crashed star size ${star.size}.`;
	}

	// Checks if user own Celestial ring or Celestial signet
	if (user.hasEquippedOrInBank('Celestial ring (uncharged)')) {
		boosts.push('+4 invisible Mining lvls for Celestial ring');
		miningLevel += 4;
	}
	// Default bronze pickaxe, last in the array
	let currentPickaxe = pickaxes[pickaxes.length - 1];
	boosts.push(
		`**${currentPickaxe.ticksBetweenRolls}** ticks between rolls for ${Items.itemNameFromId(currentPickaxe.id)}`
	);

	// For each pickaxe, if they have it, give them its' bonus and break.
	for (const pickaxe of pickaxes) {
		if (!user.hasEquippedOrInBank(pickaxe.id) || skills.mining < pickaxe.miningLvl) continue;
		currentPickaxe = pickaxe;
		boosts.pop();
		boosts.push(`**${pickaxe.ticksBetweenRolls}** ticks between rolls for ${Items.itemNameFromId(pickaxe.id)}`);
		break;
	}
	const stars = starSizes.filter(i => i.size <= star.size);
	const loot = new Bank();
	const usersWith = randInt(1, 4);
	let duration = 0;
	let dustReceived = 0;
	let totalXp = 0;
	for (const star of stars) {
		const [timeToMine, newQuantity] = determineMiningTime({
			quantity: Math.round(star.dustAvailable / usersWith),
			ore: star,
			ticksBetweenRolls: currentPickaxe.ticksBetweenRolls,
			glovesRate: 0,
			armourEffect: 0,
			miningCapeEffect: 0,
			powermining: false,
			goldSilverBoost: false,
			miningLvl: miningLevel,
			passedDuration: duration,
			hasGlory: user.hasEquipped('Amulet of glory'),
			maxTripLength: await user.calcMaxTripLength('ShootingStars'),
			hasKaramjaMedium: false
		});
		duration += timeToMine;
		dustReceived += newQuantity;
		totalXp += newQuantity * star.xp;
		for (let i = 0; i < newQuantity; i++) {
			if (percentChance(star.additionalDustPercent)) {
				dustReceived++;
			}
		}
		if (star.clueScrollChance) {
			addSkillingClueToLoot(user, 'mining', newQuantity, star.clueScrollChance, loot);
		}

		// Roll for pet
		if (star.petChance && roll((star.petChance - skills.mining * 25) / newQuantity)) {
			loot.add('Rock golem');
		}
		if (duration >= (await user.calcMaxTripLength('Mining'))) {
			break;
		}
	}

	// Add all stardust
	loot.add('Stardust', dustReceived);

	await ActivityManager.startTrip<ShootingStarsOptions>({
		userID: user.id,
		channelId,
		duration,
		lootItems: loot.toJSON(),
		usersWith,
		totalXp,
		type: 'ShootingStars',
		size: star.size
	});

	let str = `${user.minionName} is now mining a size ${star.size} Crashed Star with ${usersWith - 1 || 'no'
		} other players! The trip will take ${formatDuration(duration)}.`;

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return str;
}

const activitiesCantGetStars: activity_type_enum[] = [
	'FightCaves',
	'Wintertodt',
	'AnimatedArmour',
	'Cyclops',
	'Sepulchre',
	'Plunder',
	'Nightmare',
	'Inferno',
	'TokkulShop',
	'ShootingStars',
	'Nex',
	'TombsOfAmascut',
	'TheatreOfBlood',
	'Raids',
	'CamdozaalMining',
	'CamdozaalSmithing',
	'CamdozaalFishing'
];

export async function handleTriggerShootingStar(user: MUser, data: ActivityTaskData, components: ButtonBuilder[]) {
	if (activitiesCantGetStars.includes(data.type)) return;
	const miningLevel = user.skillsAsLevels.mining;
	const elligibleStars = starSizes.filter(i => i.chance > 0 && i.level <= miningLevel);
	const minutes = Math.floor(data.duration / Time.Minute);
	if (minutes < 1) return;
	const baseChance = Math.floor(540 / minutes);
	if (!roll(baseChance)) return;
	const shootingStarTable = new SimpleTable<Star>();
	for (const star of elligibleStars) shootingStarTable.add(star, star.chance);
	const star = shootingStarTable.roll();
	if (!star) return;

	// Got a star
	await prisma.shootingStars.create({
		data: {
			user_id: user.id,
			size: star.size,
			expires_at: new Date(Date.now() + Time.Minute * 5),
			has_been_mined: false
		}
	});
	components.push(makeShootingStarButton(star.size));
}
