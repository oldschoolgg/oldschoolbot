import { PlunderActivityTaskOptions } from './../../../lib/types/minions';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { MinigameIDsEnum } from '../../../lib/minions/data/minigames';
import { SkillsEnum } from '../../../lib/skilling/types';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { lootRoom, plunderRooms } from '../../../lib/minions/data/plunder';
export default class extends Task {
	async run({ channelID, quantity, rooms, duration, userID }: PlunderActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		user.incrementMinigameScore(MinigameIDsEnum.PyramidPlunder, quantity);
		const allRooms = plunderRooms.filter(room => rooms.includes(room.number));
		const completedRooms = [allRooms[allRooms.length - 2], allRooms[allRooms.length - 1]]
		const loot = new Bank();
		let thievingXP = 0;

		for (let i = 0; i < quantity; i++) {
			for (const room of completedRooms) {
				loot.add(lootRoom(room.number));
				thievingXP += room.xp;
			}
		}

		await user.addItemsToBank(loot.bank, true);
		const currentLevel = user.skillLevel(SkillsEnum.Thieving);
		await user.addXP(SkillsEnum.Thieving, thievingXP);
		const nextLevel = user.skillLevel(SkillsEnum.Thieving);

		let str = `${user}, ${
			user.minionName
		} finished doing the Pyramid Plunder ${quantity}x times, you received ${thievingXP.toLocaleString()} Thieving XP. 26 x urns opened.`;

		if (nextLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Thieving level is now ${nextLevel}!`;
		}

		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				loot.bank,
				`Loot From ${quantity}x Pyramid Plunder:`,
				true,
				{ showNewCL: 1 },
				user
			);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x plunder`);
				return this.client.commands.get('plunder')!.run(res, []);
			},
			image
		);
	}
}
