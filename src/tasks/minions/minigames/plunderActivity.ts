import { Events } from '@oldschoolgg/toolkit/constants';
import { Bank } from 'oldschooljs';

import { lootRoom, plunderRooms } from '@/lib/minions/data/plunder.js';
import { SkillsEnum } from '@/lib/skilling/types.js';
import type { PlunderActivityTaskOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

export const plunderTask: MinionTask = {
	type: 'Plunder',
	async run(data: PlunderActivityTaskOptions) {
		const { channelID, quantity, rooms, userID } = data;
		const user = await mUserFetch(userID);
		await user.incrementMinigameScore('pyramid_plunder', quantity);
		const allRooms = plunderRooms.filter(room => rooms.includes(room.number));
		const completedRooms = [
			allRooms.length < 2 ? allRooms[allRooms.length - 1] : allRooms[allRooms.length - 2],
			allRooms[allRooms.length - 1]
		];
		const loot = new Bank();
		let totalAmountUrns = 0;
		let thievingXP = 0;

		for (let i = 0; i < quantity; i++) {
			for (const room of completedRooms) {
				const [currentLootRoom, amountUrns] = lootRoom(user, room.number);
				totalAmountUrns += amountUrns;
				loot.add(currentLootRoom);
				thievingXP += room.xp;
			}
		}

		const { itemsAdded, previousCL } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});
		const xpRes = await user.addXP({ skillName: SkillsEnum.Thieving, amount: thievingXP, duration: data.duration });

		const str = `${user}, ${user.minionName} finished doing the Pyramid Plunder ${quantity}x times. ${totalAmountUrns}x urns opened. ${xpRes}`;

		if (loot.amount('Rocky') > 0) {
			globalClient.emit(
				Events.ServerNotification,
				`**${user.badgedUsername}'s** minion, ${
					user.minionName
				}, just received a **Rocky** <:Rocky:324127378647285771> while doing the Pyramid Plunder, their Thieving level is ${user.skillLevel(
					SkillsEnum.Thieving
				)}!`
			);
		}

		const image = await makeBankImage({
			bank: itemsAdded,
			user,
			previousCL,
			title: `Loot From ${quantity}x Pyramid Plunder:`
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, itemsAdded);
	}
};
