import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Events } from '../../../lib/constants';
import { lootRoom, plunderRooms } from '../../../lib/minions/data/plunder';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { PlunderActivityTaskOptions } from './../../../lib/types/minions';

export default class extends Task {
	async run(data: PlunderActivityTaskOptions) {
		const { channelID, quantity, rooms, userID } = data;
		const user = await this.client.fetchUser(userID);
		await incrementMinigameScore(userID, 'pyramid_plunder', quantity);
		const allRooms = plunderRooms.filter(room => rooms.includes(room.number));
		const completedRooms = [
			allRooms.length < 2 ? allRooms[allRooms.length - 1] : allRooms[allRooms.length - 2],
			allRooms[allRooms.length - 1]
		];
		const loot = new Bank();
		let amountUrns = 0;
		let totalAmountUrns = 0;
		let currentLootRoom = {};
		let thievingXP = 0;

		for (let i = 0; i < quantity; i++) {
			for (const room of completedRooms) {
				[currentLootRoom, amountUrns] = lootRoom(room.number);
				totalAmountUrns += amountUrns;
				loot.add(currentLootRoom);
				thievingXP += room.xp;
			}
		}

		const { itemsAdded, previousCL } = await user.addItemsToBank({ items: loot, collectionLog: true });
		const xpRes = await user.addXP({ skillName: SkillsEnum.Thieving, amount: thievingXP });

		let str = `${user}, ${user.minionName} finished doing the Pyramid Plunder ${quantity}x times. ${totalAmountUrns}x urns opened. ${xpRes}`;

		if (loot.amount('Rocky') > 0) {
			str += "\n\n**You have a funny feeling you're being followed...**";
			this.client.emit(
				Events.ServerNotification,
				`**${user.username}'s** minion, ${
					user.minionName
				}, just received a **Rocky** <:Rocky:324127378647285771> while doing the Pyramid Plunder, their Thieving level is ${user.skillLevel(
					SkillsEnum.Thieving
				)}!`
			);
		}

		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				itemsAdded,
				`Loot From ${quantity}x Pyramid Plunder:`,
				true,
				{ showNewCL: 1 },
				user,
				previousCL
			);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			['minigames', { pyramid_plunder: {} }, true],
			image!,
			data,
			itemsAdded
		);
	}
}
