import { activity_type_enum } from '@prisma/client';
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { percentChance, randInt, roll, Time } from 'e';
import { Bank } from 'oldschooljs';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import { Star, starSizes } from '../../../lib/data/shootingStars';
import addSkillingClueToLoot from '../../../lib/minions/functions/addSkillingClueToLoot';
import { MUserClass } from '../../../lib/MUser';
import { determineMiningTime } from '../../../lib/skilling/functions/determineMiningTime';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ActivityTaskOptions, ShootingStarsData } from '../../../lib/types/minions';
import { formatDuration, itemNameFromID } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength, patronMaxTripBonus } from '../../../lib/util/calcMaxTripLength';
import { minionName } from '../../../lib/util/minionUtils';
import { pickaxes } from '../../commands/mine';

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
	for (let star of stars) {
		let [timeToMine, newQuantity] = determineMiningTime({
			quantity: Math.round(star.dustAvailable / usersWith),
			user,
			ore: star,
			ticksBetweenRolls: currentPickaxe.ticksBetweenRolls,
			glovesRate: 0,
			armourEffect: 0,
			miningCapeEffect: 0,
			powermining: false,
			goldSilverBoost: false,
			miningLvl: miningLevel,
			passedDuration: duration
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
	const lootItems = loot.bank;

	await addSubTaskToActivityTask<ShootingStarsData>({
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		lootItems,
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
	'Nex'
];

export const starCache = new Map<string, Star & { expiry: number }>();

export function handleTriggerShootingStar(user: MUserClass, data: ActivityTaskOptions, components: ButtonBuilder[]) {
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
	const star = starRoll.item;
	const button = new ButtonBuilder()
		.setCustomId('DO_SHOOTING_STAR')
		.setLabel(`Mine Size ${star.size} Crashed Star`)
		.setEmoji('⭐')
		.setStyle(ButtonStyle.Secondary);
	components.push(button);
	starCache.set(user.id, { ...star, expiry: Date.now() + Time.Minute * 5 + patronMaxTripBonus(user) / 2 });
}
