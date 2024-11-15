import { SimpleTable } from '@oldschoolgg/toolkit/structures';
import type { activity_type_enum } from '@prisma/client';
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { Time, percentChance, randInt, roll } from 'e';
import { Bank } from 'oldschooljs';

import addSkillingClueToLoot from '../../../lib/minions/functions/addSkillingClueToLoot';
import { determineMiningTime } from '../../../lib/skilling/functions/determineMiningTime';
import { pickaxes } from '../../../lib/skilling/functions/miningBoosts';
import type { Ore } from '../../../lib/skilling/types';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { ActivityTaskData, ShootingStarsOptions } from '../../../lib/types/minions';
import { formatDuration, itemNameFromID } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength, patronMaxTripBonus } from '../../../lib/util/calcMaxTripLength';
import { minionName } from '../../../lib/util/minionUtils';
import type { MUserClass } from './../../../lib/MUser';

interface Star extends Ore {
	size: number;
	level: number;
	chance: number;
	dustAvailable: number;
	additionalDustPercent: number;
}
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

export async function shootingStarsCommand(channelID: string, user: MUserClass, star: Star): Promise<string> {
	const skills = user.skillsAsLevels;
	const boosts = [];

	let miningLevel = skills.mining;

	if (skills.mining < star.level) {
		return `${minionName(user)} needs ${star.level} Mining to mine a Crashed star size ${star.size}.`;
	}

	// Checks if user own Celestial ring or Celestial signet
	if (user.hasEquippedOrInBank('Celestial ring (uncharged)')) {
		boosts.push('+4 invisible Mining lvls for Celestial ring');
		miningLevel += 4;
	}
	// Default bronze pickaxe, last in the array
	let currentPickaxe = pickaxes[pickaxes.length - 1];
	boosts.push(`**${currentPickaxe.ticksBetweenRolls}** ticks between rolls for ${itemNameFromID(currentPickaxe.id)}`);

	// For each pickaxe, if they have it, give them its' bonus and break.
	for (const pickaxe of pickaxes) {
		if (!user.hasEquippedOrInBank(pickaxe.id) || skills.mining < pickaxe.miningLvl) continue;
		currentPickaxe = pickaxe;
		boosts.pop();
		boosts.push(`**${pickaxe.ticksBetweenRolls}** ticks between rolls for ${itemNameFromID(pickaxe.id)}`);
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
			gearBank: user.gearBank,
			ore: star,
			ticksBetweenRolls: currentPickaxe.ticksBetweenRolls,
			glovesEffect: 0,
			armourEffect: 0,
			miningCapeEffect: 0,
			powermining: false,
			goldSilverBoost: false,
			miningLvl: miningLevel,
			passedDuration: duration,
			maxTripLength: calcMaxTripLength(user, 'ShootingStars')
		});
		duration += timeToMine;
		dustReceived += newQuantity;
		totalXp += newQuantity * star.xp;
		for (let i = 0; i < newQuantity; i++) {
			if (percentChance(star.additionalDustPercent)) {
				dustReceived++;
			}
		}
		// Add clue scrolls , TODO: convert klasaUsers to user
		if (star.clueScrollChance) {
			addSkillingClueToLoot(user, SkillsEnum.Mining, newQuantity, star.clueScrollChance, loot);
		}

		// Roll for pet
		if (star.petChance && roll((star.petChance - skills.mining * 25) / newQuantity)) {
			loot.add('Rock golem');
		}
		if (duration >= calcMaxTripLength(user, 'Mining')) {
			break;
		}
	}

	// Add all stardust
	loot.add('Stardust', dustReceived);

	await addSubTaskToActivityTask<ShootingStarsOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		lootItems: loot.toJSON(),
		usersWith,
		totalXp,
		type: 'ShootingStars',
		size: star.size
	});

	let str = `${minionName(user)} is now mining a size ${star.size} Crashed Star with ${
		usersWith - 1 || 'no'
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

export const starCache = new Map<string, Star & { expiry: number }>();

export function handleTriggerShootingStar(user: MUserClass, data: ActivityTaskData, components: ButtonBuilder[]) {
	if (activitiesCantGetStars.includes(data.type)) return;
	const miningLevel = user.skillLevel(SkillsEnum.Mining);
	const elligibleStars = starSizes.filter(i => i.chance > 0 && i.level <= miningLevel);
	const minutes = data.duration / Time.Minute;
	const baseChance = 540 / minutes;
	if (!roll(baseChance)) return;
	const shootingStarTable = new SimpleTable<Star>();
	for (const star of elligibleStars) shootingStarTable.add(star, star.chance);
	const starRoll = shootingStarTable.roll();
	if (!starRoll) return;
	const star = starRoll;
	const button = new ButtonBuilder()
		.setCustomId('DO_SHOOTING_STAR')
		.setLabel(`Mine Size ${star.size} Crashed Star`)
		.setEmoji('⭐')
		.setStyle(ButtonStyle.Secondary);
	components.push(button);
	starCache.set(user.id, { ...star, expiry: Date.now() + Time.Minute * 5 + patronMaxTripBonus(user) / 2 });
}
