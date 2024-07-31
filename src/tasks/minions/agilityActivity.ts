import { Time, increaseNumByPercent, randInt, roll } from 'e';
import { Bank } from 'oldschooljs';
import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { addItemToBank, randomVariation, toKMB } from 'oldschooljs/dist/util';
import { PortentID, chargePortentIfHasCharges } from '../../lib/bso/divination';
import { MIN_LENGTH_FOR_PET } from '../../lib/constants';
import { globalDroprates } from '../../lib/data/globalDroprates';
import { ArdougneDiary, userhasDiaryTier } from '../../lib/diaries';
import { isDoubleLootActive } from '../../lib/doubleLoot';
import Agility from '../../lib/skilling/skills/agility';
import { calcUserGorajanShardChance } from '../../lib/skilling/skills/dung/dungDbFunctions';
import { type Course, SkillsEnum } from '../../lib/skilling/types';
import type { AgilityActivityTaskOptions } from '../../lib/types/minions';
import { clAdjustedDroprate, skillingPetDropRate } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { updateClientGPTrackSetting, userStatsUpdate } from '../../mahoji/mahojiSettings';

function chanceOfFailingAgilityPyramid(lvl: number) {
	if (lvl < 40) return 95;
	if (lvl < 50) return 30;
	if (lvl < 60) return 20;
	if (lvl < 75) return 5;
	return 0;
}

function calculateMarks({
	agilityLevel,
	course,
	quantity,
	hasDiaryBonus,
	usingHarry,
	boosts
}: {
	boosts: string[];
	agilityLevel: number;
	usingHarry: boolean;
	course: Course;
	quantity: number;
	hasDiaryBonus: boolean;
}) {
	if (!course.marksPer60) return 0;
	const timePerLap = course.lapTime * Time.Second;
	const maxQuantity = Math.floor((Time.Minute * 30) / timePerLap);
	let totalMarks = 0;

	for (let i = 0; i < Math.floor(course.marksPer60 * (quantity / maxQuantity)); i++) {
		if (roll(2)) {
			totalMarks += 1;
		}
	}

	if (hasDiaryBonus) {
		totalMarks = Math.floor(increaseNumByPercent(totalMarks, 25));
		boosts.push('25% extra marks of grace for Ardougne Elite Diary');
	}

	if (usingHarry) {
		const harryBonus = Math.ceil(randomVariation(totalMarks * 2, 10));
		boosts.push(`Harry found you ${harryBonus - totalMarks}x extra Marks of grace.`);
		totalMarks = harryBonus;
	} else if (course.id !== 5 && agilityLevel >= course.level + 20) {
		totalMarks = Math.ceil(totalMarks / 5);
		boosts.push('5x less marks for course level being too low');
	}

	return totalMarks;
}

export function calculateAgilityResult({
	quantity,
	course,
	agilityLevel,
	duration,
	usingHarry,
	hasDiaryBonus,
	hasAgilityPortent
}: {
	quantity: number;
	course: Course;
	agilityLevel: number;
	duration: number;
	usingHarry: boolean;
	hasDiaryBonus: boolean;
	hasAgilityPortent: boolean;
}) {
	const boosts: string[] = [];
	const loot = new Bank();

	let failChance = 100 - (100 * agilityLevel) / (course.level + 5);
	if (course.name === 'Agility Pyramid') {
		failChance = chanceOfFailingAgilityPyramid(agilityLevel);
	}

	// Calculate failed laps
	let lapsFailed = 0;
	for (let t = 0; t < quantity; t++) {
		if (randInt(1, 100) < chanceOfFailingAgilityPyramid(agilityLevel)) {
			lapsFailed += 1;
		}
	}

	let xpReceived =
		(quantity - lapsFailed / 2) * (typeof course.xp === 'number' ? course.xp : course.xp(agilityLevel));

	// Calculate Crystal Shards for Priff
	if (course.name === 'Prifddinas Rooftop Course') {
		// 15 Shards per hour
		loot.add('Crystal shard', Math.floor((duration / Time.Hour) * 15));
	}

	// Agility pyramid
	if (course.name === 'Agility Pyramid') {
		loot.add('Coins', 10_000 * (quantity - lapsFailed));
	}

	const marksOfGrace = calculateMarks({ agilityLevel, course, quantity, hasDiaryBonus, boosts, usingHarry });
	let portentXP = 0;
	if (marksOfGrace > 0) {
		if (hasAgilityPortent) {
			portentXP = marksOfGrace * 2312;
			xpReceived += portentXP;
			boosts.push(`Your Graceful portent granted you ${toKMB(portentXP)} bonus XP.`);
		} else {
			loot.add('Mark of grace', marksOfGrace);
		}
	}

	return {
		xpReceived,
		loot,
		boosts,
		failChance,
		successfulLaps: quantity - lapsFailed,
		marksOfGrace,
		lapsFailed,
		portentXP
	};
}

export const agilityTask: MinionTask = {
	type: 'Agility',
	async run(data: AgilityActivityTaskOptions) {
		const { courseID, quantity, userID, channelID, duration, alch } = data;
		const minutes = Math.round(duration / Time.Minute);
		const user = await mUserFetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Agility);

		const course = Agility.Courses.find(course => course.name === courseID)!;

		const [hasArdyElite] = await userhasDiaryTier(user, ArdougneDiary.elite);
		const hasDiaryBonus = hasArdyElite && course.name === 'Ardougne Rooftop Course';

		const messages: string[] = [];
		const petMessages: string[] = [];

		const portentResult = await chargePortentIfHasCharges({
			user,
			portentID: PortentID.GracefulPortent,
			charges: minutes
		});

		const { successfulLaps, loot, xpReceived, lapsFailed, portentXP, boosts } = calculateAgilityResult({
			quantity,
			course,
			agilityLevel: currentLevel,
			duration,
			hasDiaryBonus,
			usingHarry: user.usingPet('Harry'),
			hasAgilityPortent: portentResult.didCharge
		});

		const stats = await user.fetchStats({ laps_scores: true });
		const { laps_scores: newLapScores } = await userStatsUpdate(
			user.id,
<<<<<<< HEAD
			({ laps_scores }) => ({
				laps_scores: addItemToBank(laps_scores as ItemBank, course.id, successfulLaps),
				xp_from_graceful_portent: {
					increment: portentXP
				}
			}),
=======
			{
				laps_scores: addItemToBank(stats.laps_scores as ItemBank, course.id, quantity - lapsFailed)
			},
>>>>>>> d0e19ec01523e9e568fccf3bca3652f770df03e2
			{ laps_scores: true }
		);

		let xpRes = await user.addXP({
			skillName: SkillsEnum.Agility,
			amount: xpReceived,
			duration
		});

		// Agility pyramid gp tracking
		if (course.name === 'Agility Pyramid') {
			await userStatsUpdate(
				user.id,
				{
					gp_from_agil_pyramid: {
						increment: loot.amount('Coins')
					}
				},
				{}
			);
		}

		if (alch) {
			const alchedItem = getOSItem(alch.itemID);
			const alchGP = alchedItem.highalch! * alch.quantity;
			loot.add('Coins', alchGP);
			xpRes += ` ${await user.addXP({
				skillName: SkillsEnum.Magic,
				amount: alch.quantity * 65,
				duration
			})}`;
			await updateClientGPTrackSetting('gp_alch', alchGP);
		}

		let str = `${user}, ${user.minionName} finished ${quantity} ${course.name} laps and fell on ${lapsFailed} of them.\nYou received: ${loot}.\n${xpRes}`;

		// Roll for monkey backpacks
		if (course.id === 6) {
			const currentLapCount = (newLapScores as ItemBank)[course.id];
			for (const monkey of Agility.MonkeyBackpacks) {
				if (currentLapCount < monkey.lapsRequired) break;
				if (!user.hasEquippedOrInBank(monkey.id)) {
					loot.add(monkey.id);
					messages.push(`You received the ${monkey.name} monkey backpack!`);
				}
			}
		}

		// Roll for pets
		if (duration >= MIN_LENGTH_FOR_PET) {
			if (course.id === 4) {
				const scruffyDroprate = clAdjustedDroprate(
					user,
					'Scruffy',
					globalDroprates.scruffy.baseRate,
					globalDroprates.scruffy.clIncrease
				);
				for (let i = 0; i < minutes; i++) {
					if (roll(scruffyDroprate)) {
						loot.add('Scruffy');
						petMessages.push(
							"<:scruffy:749945071146762301> As you jump off the rooftop in Varrock, a stray dog covered in flies approaches you. You decide to adopt the dog, and name him 'Scruffy'."
						);
						break;
					}
				}
			}

			if (course.id === 11) {
				for (let i = 0; i < minutes; i++) {
					if (roll(1600)) {
						loot.add('Harry');
						petMessages.push(
							'<:harry:749945071104819292> As you jump across a rooftop, you notice a monkey perched on the roof - which has escaped from the Ardougne Zoo! You decide to adopt the monkey, and call him Harry.'
						);
						break;
					}
				}
			}

			if (course.id === 12) {
				const dropRate = clAdjustedDroprate(user, 'Skipper', 1600, 1.3);
				for (let i = 0; i < minutes; i++) {
					if (roll(dropRate)) {
						loot.add('Skipper');
						petMessages.push(
							"<:skipper:755853421801766912> As you finish the Penguin agility course, a lone penguin asks if you'd like to hire it as your accountant, you accept."
						);
						break;
					}
				}
			}

			if (course.id === 30) {
				if (
					user.skillLevel(SkillsEnum.Dungeoneering) >= 80 &&
					roll(Math.floor((calcUserGorajanShardChance(user).chance * 2.5) / minutes))
				) {
					const item = roll(30) ? getOSItem('Dungeoneering dye') : getOSItem('Gorajan shards');
					let shardQty = 1;
					if (isDoubleLootActive(duration)) {
						shardQty *= 2;
					}
					loot.add(item.id, shardQty);
					messages.push(`You received **${shardQty}x ${item.name}**`);
				}
			}
		}
		// Roll for pet
		const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Agility, course.petChance);
		if (roll(petDropRate / quantity)) {
			loot.add('Giant squirrel');
			petMessages.push("You have a funny feeling you're being followed...");
		}

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		for (const msgs of [boosts, messages, petMessages]) {
			if (msgs.length > 0) str += `\n\n${msgs.join('\n')}`;
		}

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
