import { activity_type_enum, User } from '@prisma/client';
import { MessageActionRowComponentResolvable, MessageButton } from 'discord.js';
import { randInt, reduceNumByPercent, roll, sumArr, Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import { SkillsEnum } from '../../../lib/skilling/types';
import { ActivityTaskOptions } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

interface Star {
	size: number;
	level: number;
	chance: number;
	dustAvailable: number;
	xpPerDust: number;
	minTotalDuration: number;
	additionalDustPercent: number;
}
const starSizes: Star[] = [
	{
		size: 9,
		level: 90,
		chance: 3,
		dustAvailable: 15,
		additionalDustPercent: 90,
		xpPerDust: 244,
		minTotalDuration: 9.76 * Time.Minute
	},
	{
		size: 8,
		level: 80,
		chance: 5,
		dustAvailable: 40,
		additionalDustPercent: 72,
		xpPerDust: 162,
		minTotalDuration: 9.71 * Time.Minute
	},
	{
		size: 7,
		level: 70,
		chance: 9,
		dustAvailable: 40,
		additionalDustPercent: 56,
		xpPerDust: 123,
		minTotalDuration: 9.58 * Time.Minute
	},
	{
		size: 6,
		level: 60,
		chance: 12,
		dustAvailable: 80,
		additionalDustPercent: 42,
		xpPerDust: 74,
		minTotalDuration: 9.44 * Time.Minute
	},
	{
		size: 5,
		level: 50,
		chance: 17,
		dustAvailable: 175,
		additionalDustPercent: 30,
		xpPerDust: 48,
		minTotalDuration: 9.18 * Time.Minute
	},
	{
		size: 4,
		level: 40,
		chance: 20,
		dustAvailable: 300,
		additionalDustPercent: 20,
		xpPerDust: 31,
		minTotalDuration: 8.59 * Time.Minute
	},
	{
		size: 3,
		level: 30,
		chance: 18,
		dustAvailable: 430,
		additionalDustPercent: 12,
		xpPerDust: 26,
		minTotalDuration: 7.66 * Time.Minute
	},
	{
		size: 2,
		level: 20,
		chance: 16,
		dustAvailable: 700,
		additionalDustPercent: 6,
		xpPerDust: 22,
		minTotalDuration: 6.33 * Time.Minute
	},
	{
		size: 1,
		level: 10,
		chance: 0,
		dustAvailable: 1200,
		additionalDustPercent: 2,
		xpPerDust: 12,
		minTotalDuration: 4 * Time.Minute
	}
];

export interface ShootingStarsData extends ActivityTaskOptions {
	size: number;
}

export async function shootingStarsCommand(channelID: bigint, user: User, star: Star) {
	const duration = sumArr(
		starSizes.filter(i => i.size <= star.size).map(i => i.minTotalDuration + Time.Second * randInt(10, 60))
	);

	await addSubTaskToActivityTask<ShootingStarsData>({
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		type: 'ShootingStars',
		size: star.size
	});

	return duration;
}

export async function shootingStarsActivity(data: ShootingStarsData) {
	const user = await globalClient.fetchUser(data.userID);
	const star = starSizes.find(i => i.size === data.size)!;
	const subStars = starSizes.filter(i => i.size <= data.size);
	const loot = new Bank();
	let xp = 0;
	const usersWith = randInt(1, 4);
	for (const subStar of subStars) {
		let dustReceived = subStar.dustAvailable;
		if (usersWith > 1) dustReceived = Math.floor(reduceNumByPercent(dustReceived, usersWith * 10));
		loot.add('Stardust', dustReceived);
		xp += subStar.xpPerDust * dustReceived;
	}
	await user.addItemsToBank({ items: loot, collectionLog: true });
	const xpStr = await user.addXP({
		skillName: SkillsEnum.Mining,
		amount: xp,
		duration: data.duration
	});

	let str = `${user}, ${user.minionName} finished mining a size ${star.size} Shooting Star, there was ${
		usersWith - 1 || 'no'
	} other players mining with you. You received ${loot}. ${xpStr}`;

	handleTripFinish(user, data.channelID, str, undefined, undefined!, data, null);
}

const activitiesCantGetStars: activity_type_enum[] = [
	'FightCaves',
	'Wintertodt',
	'AnimatedArmour',
	'Cyclops',
	'FishingTrawler',
	'Sepulchre',
	'Plunder',
	'Nightmare',
	'Inferno',
	'Trekking',
	'TokkulShop',
	'TheatreOfBlood',
	'ShootingStars',
	'Nex'
];

export const starCache = new Map<string, Star & { expiry: number }>();

export function handleTriggerShootingStar(
	user: KlasaUser,
	data: ActivityTaskOptions,
	components: MessageActionRowComponentResolvable[][]
) {
	if (activitiesCantGetStars.includes(data.type)) return;
	const miningLevel = user.skillLevel(SkillsEnum.Mining);
	const elligibleStars = starSizes.filter(i => i.chance > 0 && i.level <= miningLevel);
	const minutes = data.duration / Time.Minute;
	const baseChance = 800 / minutes;
	console.log(`${user.username} had a 1 in ${baseChance} chance of getting a star`);
	if (1 > 2 && !roll(baseChance)) return;
	const shootingStarTable = new SimpleTable<Star>();
	for (const star of elligibleStars) shootingStarTable.add(star, star.chance);
	const starRoll = shootingStarTable.roll();
	if (!starRoll) return;
	const star = starRoll.item;
	const button = new MessageButton()
		.setCustomID('DO_SHOOTING_STAR')
		.setLabel(`Mine Size ${star.size} Star`)
		.setEmoji('⭐')
		.setStyle('SECONDARY');
	components![0]!.push(button);
	starCache.set(user.id, { ...star, expiry: Date.now() + Time.Minute * 1.5 });
}
