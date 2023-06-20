import { Prisma } from '@prisma/client';
import { randFloat, roll } from 'e';
import { Bank } from 'oldschooljs';

import birdhouses from '../../../lib/skilling/skills/hunter/birdHouseTrapping';
import { BirdhouseData } from '../../../lib/skilling/skills/hunter/defaultBirdHouseTrap';
import { SkillsEnum } from '../../../lib/skilling/types';
import { BirdhouseActivityTaskOptions } from '../../../lib/types/minions';
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
		const currentHunterLevel = user.skillLevel(SkillsEnum.Hunter);
		const currentCraftingLevel = user.skillLevel(SkillsEnum.Crafting);
		let hunterXP = 0;
		let craftingXP = 0;
		let strungRabbitFoot = user.hasEquipped('Strung rabbit foot');
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
				str += await user.addXP({ skillName: SkillsEnum.Crafting, amount: craftingXP, source: 'Birdhouses' });
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
			await user.addXP({ skillName: SkillsEnum.Hunter, amount: hunterXP, source: 'Birdhouses' });
			const newHuntLevel = user.skillLevel(SkillsEnum.Hunter);

			str += `\n\nYou received ${hunterXP.toLocaleString()} XP from collecting the birdhouses.`;

			if (placing && gotCraft) {
				craftingXP = birdhouse.craftXP * 4;
				await user.addXP({ skillName: SkillsEnum.Crafting, amount: craftingXP, source: 'Birdhouses' });
				str += `You also received ${craftingXP.toLocaleString()} crafting XP for making own birdhouses.`;
				const newCraftLevel = user.skillLevel(SkillsEnum.Crafting);
				if (newCraftLevel > currentCraftingLevel) {
					str += `\n\n${user.minionName}'s Crafting level is now ${newCraftLevel}!`;
				}
			}

			if (newHuntLevel > currentHunterLevel) {
				str += `\n${user.minionName}'s Hunter level is now ${newHuntLevel}!`;
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
