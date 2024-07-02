import type { Prisma } from '@prisma/client';
import { randFloat, roll } from 'e';
import { Bank } from 'oldschooljs';

import birdhouses from '../../../lib/skilling/skills/hunter/birdHouseTrapping';
import type { BirdhouseData } from '../../../lib/skilling/skills/hunter/defaultBirdHouseTrap';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { BirdhouseActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';
import { sendToChannelID } from '../../../lib/util/webhook';

const clues = [
	[itemID('Clue scroll(elite)'), 1 / 10],
	[itemID('Clue scroll(hard)'), 2 / 10],
	[itemID('Clue scroll(medium)'), 3 / 10],
	[itemID('Clue scroll(easy)'), 4 / 10]
];

export const birdHouseTask: MinionTask = {
	type: 'Birdhouse',
	async run(data: BirdhouseActivityTaskOptions) {
		const { birdhouseName, birdhouseData, userID, channelID, duration, placing, gotCraft, currentDate } = data;

		const user = await mUserFetch(userID);
		let hunterXP = 0;
		let craftingXP = 0;
		const strungRabbitFoot = user.hasEquipped('Strung rabbit foot');
		const loot = new Bank();

		const birdhouse = birdhouses.find(_birdhouse => _birdhouse.name === birdhouseName);
		if (!birdhouse) return;

		if (!placing || !gotCraft) {
			loot.add('Clockwork', 4);
		}

		if (!birdhouseData.birdhousePlaced) {
			let str = `${user}, ${user.minionName} finished placing 4x ${birdhouse.name}.`;

			if (placing && gotCraft) {
				craftingXP = birdhouse.craftXP * 4;
				str += await user.addXP({
					skillName: SkillsEnum.Crafting,
					amount: craftingXP,
					duration: data.duration,
					source: 'Birdhouses'
				});
			}

			const updateBirdhouseData: BirdhouseData = {
				lastPlaced: birdhouse.name,
				birdhousePlaced: true,
				birdhouseTime: currentDate + duration
			};
			await user.update({
				minion_birdhouseTraps: updateBirdhouseData as any as Prisma.InputJsonObject
			});

			str += `\n\n${user.minionName} tells you to come back after your birdhouses are full!`;

			sendToChannelID(channelID, { content: str });
		} else {
			let str = '';
			const birdhouseToCollect = birdhouses.find(_birdhouse => _birdhouse.name === birdhouseData.lastPlaced);
			if (!birdhouseToCollect) return;
			if (placing) {
				str = `${user}, ${user.minionName} finished placing 4x ${birdhouse.name} and collecting 4x full ${birdhouseToCollect.name}.`;
			} else {
				str = `${user}, ${user.minionName} finished collecting 4x full ${birdhouseToCollect.name}.`;
			}

			for (let i = 0; i < 4; i++) {
				if (!roll(200)) continue;
				let nextTier = false;
				let gotClue = false;
				for (const clue of clues) {
					if (nextTier || randFloat(0, 1) <= clue[1]) {
						if (user.bank.amount(clue[0]) >= 1 || loot.amount(clue[0]) >= 1) {
							nextTier = true;
							continue;
						}
						gotClue = true;
						loot.add(clue[0]);
						break;
					}
				}
				if (!gotClue && roll(1000)) {
					loot.add('Clue scroll(beginner)');
				}
			}

			hunterXP = birdhouseToCollect.huntXP * 4;
			for (let i = 0; i < 4; i++) {
				loot.add(birdhouseToCollect.table.roll());
				if (strungRabbitFoot) {
					loot.add(birdhouseToCollect.strungRabbitFootTable.roll());
				} else {
					loot.add(birdhouseToCollect.normalNestTable.roll());
				}
			}
			await transactItems({
				userID: user.id,
				collectionLog: true,
				itemsToAdd: loot
			});

			const xpRes = await user.addXP({
				skillName: SkillsEnum.Hunter,
				amount: hunterXP,
				duration: data.duration,
				source: 'Birdhouses'
			});

			str += `\n\n${xpRes} from collecting the birdhouses.`;

			if (placing && gotCraft) {
				craftingXP = birdhouse.craftXP * 4;
				const xpRes = await user.addXP({
					skillName: SkillsEnum.Crafting,
					amount: craftingXP,
					duration: data.duration,
					source: 'Birdhouses'
				});
				str += `${xpRes} for making own birdhouses.`;
			}

			str += `\n\nYou received: ${loot}.`;

			if (strungRabbitFoot) {
				str += "\nYour strung rabbit foot necklace increases the chance of receiving bird's eggs and rings.";
			}

			let updateBirdhouseData: BirdhouseData = {
				lastPlaced: null,
				birdhousePlaced: false,
				birdhouseTime: 0
			};

			if (placing) {
				updateBirdhouseData = {
					lastPlaced: birdhouse.name,
					birdhousePlaced: true,
					birdhouseTime: currentDate + duration
				};
			}

			await user.update({
				minion_birdhouseTraps: updateBirdhouseData as any as Prisma.InputJsonObject
			});

			if (!placing) {
				str += '\nThe birdhouses have been cleared. The birdhouse spots are ready to have new birdhouses.';
			} else {
				str += `\n${user.minionName} tells you to come back after your birdhouses are full!`;
			}

			handleTripFinish(user, channelID, str, undefined, data, loot);
		}
	}
};
