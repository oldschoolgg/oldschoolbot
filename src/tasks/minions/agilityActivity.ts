import { percentChance, randInt, roll } from '@oldschoolgg/rng';
import { Emoji, Events, increaseNumByPercent, Time } from '@oldschoolgg/toolkit';
import { XpGainSource } from '@prisma/client';
import { addItemToBank, Bank, type ItemBank, Items } from 'oldschooljs';

import { ArdougneDiary, userhasDiaryTier } from '@/lib/diaries.js';
import Agility from '@/lib/skilling/skills/agility.js';
import { zeroTimeFletchables } from '@/lib/skilling/skills/fletching/fletchables/index.js';
import type { AgilityActivityTaskOptions } from '@/lib/types/minions.js';
import { calculateBryophytaRuneSavings } from '@/lib/util/bryophytaRuneSavings.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { logError } from '@/lib/util/logError.js';
import { skillingPetDropRate } from '@/lib/util.js';

function chanceOfFailingAgilityPyramid(user: MUser) {
	const lvl = user.skillsAsLevels.agility;
	if (lvl < 40) return 95;
	if (lvl < 50) return 30;
	if (lvl < 60) return 20;
	if (lvl < 75) return 5;
	return 0;
}

export const agilityTask: MinionTask = {
	type: 'Agility',
	async run(data: AgilityActivityTaskOptions) {
		const { courseID, quantity, userID, channelID, duration, alch, fletch, zeroTimePreferenceRole } = data;
		const user = await mUserFetch(userID);
		const loot = new Bank();
		const currentLevel = user.skillsAsLevels.agility;

		const course = Agility.Courses.find(course => course.id === courseID);

		if (!course) {
			logError(`Invalid course ID provided: ${courseID}`);
			return;
		}

		// Calculate failed laps
		let lapsFailed = 0;
		if (!course.cantFail) {
			if (course.name === 'Agility Pyramid') {
				for (let t = 0; t < quantity; t++) {
					if (randInt(1, 100) < chanceOfFailingAgilityPyramid(user)) {
						lapsFailed += 1;
					}
				}
			} else {
				for (let t = 0; t < quantity; t++) {
					if (randInt(1, 100) > (100 * user.skillsAsLevels.agility) / (course.level + 5)) {
						lapsFailed += 1;
					}
				}
			}
		}

		const stats = await user.fetchStats();
		const { laps_scores: newLapScores } = await user.statsUpdate({
			laps_scores: addItemToBank(stats.laps_scores as ItemBank, course.id, quantity - lapsFailed)
		});
		const xpReceived =
			(quantity - lapsFailed / 2) * (typeof course.xp === 'number' ? course.xp : course.xp(currentLevel));
		const xpMessages: string[] = [];
		xpMessages.push(
			await user.addXP({
				skillName: 'agility',
				amount: xpReceived,
				duration
			})
		);

		// Calculate marks of grace
		let totalMarks = 0;
		const timePerLap = course.lapTime * Time.Second;
		const maxQuantity = Math.floor((Time.Minute * 30) / timePerLap);
		let diaryBonus = false;
		if (course.marksPer60) {
			const markChance = Math.floor(course.marksPer60 * (quantity / maxQuantity));
			for (let i = 0; i < markChance; i++) {
				if (roll(2)) totalMarks++;
			}
			if (course.id !== 5 && user.skillsAsLevels.agility >= course.level + 20) {
				totalMarks = Math.ceil(totalMarks / 5);
			}
			const [hasArdyElite] = await userhasDiaryTier(user, ArdougneDiary.elite);
			if (hasArdyElite && course.name === 'Ardougne Rooftop Course') {
				totalMarks = Math.floor(increaseNumByPercent(totalMarks, 25));
				diaryBonus = true;
			}
			loot.add('Mark of grace', totalMarks);
		}

		// Custom loot from various courses
		if (course.name === 'Prifddinas Rooftop Course') {
			loot.add('Crystal shard', quantity); // 1 shard per lap
		}
		if (course.name === 'Colossal Wyrm Agility Course') {
			for (let i = 0; i < quantity; i++) {
				if (roll(3)) {
					loot.add('termites', randInt(8, 10));
					if (percentChance(75)) {
						loot.add('blessed bone shards', randInt(22, 28));
					}
				}
			}
		}
		if (course.name === 'Agility Pyramid') {
			loot.add('Coins', 10_000 * (quantity - lapsFailed));
			await user.statsUpdate({
				gp_from_agil_pyramid: {
					increment: loot.amount('Coins')
				}
			});
		}
		let monkeyStr = '';
		if (course.name === 'Ape Atoll Agility Course') {
			const currentLapCount = (newLapScores as ItemBank)[course.id];
			for (const monkey of Agility.MonkeyBackpacks) {
				if (currentLapCount < monkey.lapsRequired) break;
				if (!user.hasEquippedOrInBank(monkey.id)) {
					loot.add(monkey.id);
					monkeyStr = `\nYou received the ${monkey.name} monkey backpack!`;
				}
			}
		}

		let fletchable: (typeof zeroTimeFletchables)[number] | undefined;
		let fletchQuantity = 0;
		let alchItemNameForSummary: string | null = null;

		if (fletch && fletch.qty > 0) {
			fletchable = zeroTimeFletchables.find(item => item.id === fletch.id);
			if (!fletchable) {
				throw new Error(`Fletchable id ${fletch.id} not found for agility laps.`);
			}

			fletchQuantity = fletch.qty;
			const quantityToGive = fletchable.outputMultiple
				? fletchQuantity * fletchable.outputMultiple
				: fletchQuantity;
			loot.add(fletchable.id, quantityToGive);

			const fletchXpRes = await user.addXP({
				skillName: 'fletching',
				amount: fletchQuantity * fletchable.xp,
				duration,
				source: XpGainSource.ZeroTimeActivity
			});
			xpMessages.push(fletchXpRes);
		}

		let savedRunesFromAlching = 0;
		if (alch) {
			const alchedItem = Items.getOrThrow(alch.itemID);
			alchItemNameForSummary = alchedItem.name;
			const alchGP = alchedItem.highalch! * alch.quantity;
			loot.add('Coins', alchGP);
			const { savedRunes, savedBank } = calculateBryophytaRuneSavings({
				user,
				quantity: alch.quantity
			});
			savedRunesFromAlching = savedRunes;
			if (savedBank) {
				loot.add(savedBank);
			}
			const magicXpRes = await user.addXP({
				skillName: 'magic',
				amount: alch.quantity * 65,
				duration,
				source: XpGainSource.ZeroTimeActivity
			});
			xpMessages.push(magicXpRes);
			await ClientSettings.updateClientGPTrackSetting('gp_alch', alchGP);
		}

		let str = `${user}, ${user.minionName} finished ${quantity} ${
			course.name
		} laps and fell on ${lapsFailed} of them.\nYou received: ${loot}${
			diaryBonus ? ' (25% bonus Marks for Ardougne Elite diary)' : ''
		}.\n${xpMessages.join(' ')}${monkeyStr}`;

		if (savedRunesFromAlching > 0) {
			str += `\nYour Bryophyta's staff saved you ${savedRunesFromAlching} Nature runes.`;
		}
		if (alch && alchItemNameForSummary) {
			const fallbackNote = zeroTimePreferenceRole === 'fallback' ? ' (fallback preference)' : '';
			str += `\nYou also alched ${alch.quantity}x ${alchItemNameForSummary}${fallbackNote}.`;
		}

		if (fletchable && fletch && fletchQuantity > 0) {
			const setsText = fletchable.outputMultiple ? ' sets of' : '';
			const fallbackNote = zeroTimePreferenceRole === 'fallback' ? ' (fallback preference)' : '';
			str += `\nYou also fletched ${fletchQuantity}${setsText} ${fletchable.name}${fallbackNote}.`;
		}

		// Roll for pet
		const { petDropRate } = skillingPetDropRate(
			user,
			'agility',
			typeof course.petChance === 'number' ? course.petChance : course.petChance(currentLevel)
		);
		if (roll(petDropRate / quantity)) {
			loot.add('Giant squirrel');
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Agility} **${user.usernameOrMention}'s** minion, ${user.minionName}, just received a Giant squirrel while running ${course.name} laps at level ${currentLevel} Agility!`
			);
		}

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
