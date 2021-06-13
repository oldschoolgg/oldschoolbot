import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { UserSettings } from '../../../lib/settings/types/UserSettings';
import birdhouses from '../../../lib/skilling/skills/hunter/birdHouseTrapping';
import { BirdhouseData } from '../../../lib/skilling/skills/hunter/defaultBirdHouseTrap';
import { SkillsEnum } from '../../../lib/skilling/types';
import { BirdhouseActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { sendToChannelID } from '../../../lib/util/webhook';

export default class extends Task {
	async run(data: BirdhouseActivityTaskOptions) {
		const {
			birdhouseName,
			birdhouseData,
			userID,
			channelID,
			duration,
			placing,
			gotCraft,
			currentDate
		} = data;

		const user = await this.client.users.fetch(userID);
		const currentHunterLevel = user.skillLevel(SkillsEnum.Hunter);
		const currentCraftingLevel = user.skillLevel(SkillsEnum.Crafting);
		let hunterXP = 0;
		let craftingXP = 0;
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
					amount: craftingXP
				});
			}

			const updateBirdhouseData: BirdhouseData = {
				lastPlaced: birdhouse.name,
				birdhousePlaced: true,
				birdhouseTime: currentDate + duration
			};

			await user.settings.update(UserSettings.Minion.BirdhouseTraps, updateBirdhouseData);

			str += `\n\n${user.minionName} tells you to come back after your birdhouses are full!`;

			sendToChannelID(this.client, channelID, { content: str });
		} else {
			let str = '';
			const birdhouseToCollect = birdhouses.find(
				_birdhouse => _birdhouse.name === birdhouseData.lastPlaced
			);
			if (!birdhouseToCollect) return;
			if (placing) {
				str = `${user}, ${user.minionName} finished placing 4x ${birdhouse.name} and collecting 4x full ${birdhouseToCollect.name}.`;
			} else {
				str = `${user}, ${user.minionName} finished collecting 4x full ${birdhouseToCollect.name}.`;
			}

			hunterXP = birdhouseToCollect.huntXP * 4;
			for (let i = 0; i < 4; i++) {
				loot.add(birdhouseToCollect.table.roll());
			}
			await user.addItemsToBank(loot.values(), true);
			await user.addXP({
				skillName: SkillsEnum.Hunter,
				amount: hunterXP
			});
			const newHuntLevel = user.skillLevel(SkillsEnum.Hunter);

			str += `\n\nYou received ${hunterXP.toLocaleString()} XP from collecting the birdhouses.`;

			if (placing && gotCraft) {
				craftingXP = birdhouse.craftXP * 4;
				await user.addXP({
					skillName: SkillsEnum.Crafting,
					amount: craftingXP
				});
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

			await user.settings.update(UserSettings.Minion.BirdhouseTraps, updateBirdhouseData);

			if (!placing) {
				str += `\nThe birdhouses have been cleared. The birdhouse spots are ready to have new birdhouses.`;
			} else {
				str += `\n${user.minionName} tells you to come back after your birdhouses are full!`;
			}

			handleTripFinish(
				this.client,
				user,
				channelID,
				str,
				undefined,
				undefined,
				data,
				loot.bank
			);
		}
	}
}
