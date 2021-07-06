import { increaseNumByPercent, objectEntries, randInt, roll, Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { GlobetrottlerOutfit } from '../../commands/Minion/mclue';
import { Activity, Emoji, Events, MIN_LENGTH_FOR_PET } from '../../lib/constants';
import { globetrotterReqs } from '../../lib/customItems';
import { FaladorDiary, userhasDiaryTier } from '../../lib/diaries';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Agility from '../../lib/skilling/skills/agility';
import { SkillsEnum } from '../../lib/skilling/types';
import { AgilityActivityTaskOptions } from '../../lib/types/minions';
import { addItemToBank, itemID, rand, randomVariation, toTitleCase, updateGPTrackSetting } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { sendToChannelID } from '../../lib/util/webhook';

const globetrotterTicketPiece: Record<number, number> = {
	[itemID('Globetrotter message (beginner)')]: itemID('Globetrotter headress'),
	[itemID('Globetrotter message (easy)')]: itemID('Globetrotter top'),
	[itemID('Globetrotter message (medium)')]: itemID('Globetrotter legs'),
	[itemID('Globetrotter message (hard)')]: itemID('Globetrotter gloves'),
	[itemID('Globetrotter message (elite)')]: itemID('Globetrotter boots'),
	[itemID('Globetrotter message (master)')]: itemID('Globetrotter backpack')
};

function getChallengeXp(xpMultiplier: number) {
	const xpReceived: Record<string, number> = {};
	Object.keys(globetrotterReqs).map(async skill => (xpReceived[skill] = rand(25_000, 75_000) * xpMultiplier));
	return xpReceived;
}

export default class extends Task {
	async run(data: AgilityActivityTaskOptions) {
		let { courseID, quantity, userID, channelID, duration, alch, ticketID } = data;
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Agility);

		const course = Agility.Courses.find(course => course.name === courseID)!;

		// Challenge mode pieces missing, in case we need to add them back.
		const piecesMissing = new Bank();
		let piecesMissingStr = '';

		if (course.name === 'Gielinor Challenge Course') {
			if (!new Bank(user.collectionLog).has(GlobetrottlerOutfit)) {
				let xpMultiplier = 0;
				let xpToReceive: Record<string, number> = {};
				try {
					const totalSucessfulLaps = user.settings.get(UserSettings.LapsScores)[course.id] ?? 0;
					// Makes sure the first try is a success
					if (roll(Math.max(2, totalSucessfulLaps + 2))) {
						await user.settings.update(
							UserSettings.LapsScores,
							addItemToBank(user.settings.get(UserSettings.LapsScores), course.id, 1)
						);
						xpMultiplier = totalSucessfulLaps + 2;
						await user.addItemsToBank({ [globetrotterTicketPiece[ticketID!]]: 1 }, true);
						xpToReceive = getChallengeXp(xpMultiplier);
						return sendToChannelID(this.client, channelID, {
							content: `You beat the Gielinor Challenge for the ${totalSucessfulLaps + 1}${
								['st', 'nd', 'rd'][totalSucessfulLaps % 10] || 'th'
							} time! Congratulations! As your prize, you receive **${objectEntries(xpToReceive)
								.map(value => `${value[1].toLocaleString()} XP in ${toTitleCase(value[0])}`)
								.join(', ')}** and a special **${getOSItem(globetrotterTicketPiece[ticketID!]).name}**!`
						});
					}
					xpMultiplier = rand(1, totalSucessfulLaps ?? 1);
					xpToReceive = getChallengeXp(xpMultiplier);
					return sendToChannelID(this.client, channelID, {
						content: `You failed the Gielinor Challenge. You still managed to get ${objectEntries(
							xpToReceive
						)
							.map(value => `${value[1].toLocaleString()} XP in ${toTitleCase(value[0])}`)
							.join(', ')}. Try again!`
					});
				} finally {
					Object.entries(xpToReceive).map(async skill =>
						user.addXP({
							skillName: SkillsEnum[skill[0] as keyof typeof SkillsEnum],
							amount: skill[1],
							duration
						})
					);
				}
			} else {
				// Check if the user still have the outfit pieces in the bank or equipped. Give back the pieces missing.
				GlobetrottlerOutfit.map(itemId => piecesMissing.add(itemId));
				piecesMissing.remove(user.allItemsOwned());
				if (piecesMissing.items().length > 0) {
					piecesMissingStr +=
						'The gatekeeper notices that you have lost some pieces of the globetrotter outfit and ' +
						`give you some extra. You can see that he is really dissapointed in you and tells you to keep them safe. You receive ${piecesMissing}.`;
				}
			}
		}

		// Calculate failed laps
		let lapsFailed = 0;
		for (let t = 0; t < quantity; t++) {
			if (randInt(1, 100) > (100 * user.skillLevel(SkillsEnum.Agility)) / (course.level + 5)) {
				lapsFailed += 1;
			}
		}

		// Calculate marks of grace
		let totalMarks = 0;
		const timePerLap = course.lapTime * Time.Second;
		const maxQuantity = Math.floor(user.maxTripLength(Activity.Agility) / timePerLap);
		if (course.marksPer60) {
			for (let i = 0; i < Math.floor(course.marksPer60 * (quantity / maxQuantity)); i++) {
				if (roll(2)) {
					totalMarks += 1;
				}
			}
		}

		if (user.usingPet('Harry')) {
			totalMarks = Math.ceil(randomVariation(totalMarks * 2, 10));
		} else if (user.skillLevel(SkillsEnum.Agility) >= course.level + 20) {
			totalMarks = Math.ceil(totalMarks / 5);
		}

		const [hasFallyElite] = await userhasDiaryTier(user, FaladorDiary.elite);
		const diaryBonus = hasFallyElite && course.name === 'Ardougne Rooftop Course';
		if (diaryBonus) {
			totalMarks = Math.floor(increaseNumByPercent(totalMarks, 25));
		}

		const xpReceived = (quantity - lapsFailed / 2) * course.xp;

		await user.settings.update(
			UserSettings.LapsScores,
			addItemToBank(user.settings.get(UserSettings.LapsScores), course.id, quantity - lapsFailed)
		);

		let xpRes = await user.addXP({
			skillName: SkillsEnum.Agility,
			amount: xpReceived,
			duration
		});

		const loot = new Bank({
			'Mark of grace': totalMarks
		});

		loot.add(piecesMissing);

		if (alch) {
			const alchedItem = getOSItem(alch.itemID);
			const alchGP = alchedItem.highalch * alch.quantity;
			loot.add('Coins', alchGP);
			xpRes += ` ${await user.addXP({
				skillName: SkillsEnum.Magic,
				amount: alch.quantity * 65,
				duration
			})}`;
			updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceAlching, alchGP);
		}

		let str = `${user}, ${user.minionName} finished ${quantity} ${
			course.name
		} laps and fell on ${lapsFailed} of them.\nYou received: ${loot} ${
			diaryBonus ? '(2x bonus Marks for Ardougne Elite diary)' : ''
		}.\n${xpRes}`;

		if (user.usingPet('Harry')) {
			str += 'Harry found you extra Marks of grace.';
		}
		if (course.id === 6) {
			const currentLapCount = user.settings.get(UserSettings.LapsScores)[course.id];
			for (const monkey of Agility.MonkeyBackpacks) {
				if (currentLapCount < monkey.lapsRequired) break;
				if (!user.hasItemEquippedOrInBank(monkey.id)) {
					loot.add(monkey.id);
					str += `\nYou received the ${monkey.name} monkey backpack!`;
				}
			}
		}
		if (duration >= MIN_LENGTH_FOR_PET) {
			const minutes = duration / Time.Minute;
			if (course.id === 4) {
				for (let i = 0; i < minutes; i++) {
					if (roll(4000)) {
						loot.add('Scruffy');
						str +=
							"\n\n<:scruffy:749945071146762301> As you jump off the rooftop in Varrock, a stray dog covered in flies approaches you. You decide to adopt the dog, and name him 'Scruffy'.";
						break;
					}
				}
			}

			if (course.id === 11) {
				for (let i = 0; i < minutes; i++) {
					if (roll(1600)) {
						loot.add('Harry');
						str +=
							'\n\n<:harry:749945071104819292> As you jump across a rooftop, you notice a monkey perched on the roof - which has escaped from the Ardougne Zoo! You decide to adopt the monkey, and call him Harry.';
						break;
					}
				}
			}

			if (course.id === 12) {
				for (let i = 0; i < minutes; i++) {
					if (roll(1600)) {
						loot.add('Skipper');
						str +=
							"\n\n<:skipper:755853421801766912> As you finish the Penguin agility course, a lone penguin asks if you'd like to hire it as your accountant, you accept.";
						break;
					}
				}
			}
		}
		// Roll for pet
		if (course.petChance && roll((course.petChance - user.skillLevel(SkillsEnum.Agility) * 25) / quantity)) {
			loot.add('Giant squirrel');
			str += "\nYou have a funny feeling you're being followed...";
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Agility} **${user.username}'s** minion, ${user.minionName}, just received a Giant squirrel while running ${course.name} laps at level ${currentLevel} Agility!`
			);
		}

		if (piecesMissingStr) {
			str += `\n\n${piecesMissingStr}\n\n`;
		}

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				const flags: Record<string, string> = alch === null ? {} : { alch: 'alch' };
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				if (!res.prompter) res.prompter = {};
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				res.prompter.flags = flags;

				user.log(`continued trip of ${quantity}x ${course.name} laps`);
				return this.client.commands.get('laps')!.run(res, [quantity, course.aliases[0]]);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
