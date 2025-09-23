import { Bank } from 'oldschooljs';

import { userHasFlappy } from '@/lib/invention/inventions.js';
import { lootRoom, plunderRooms } from '@/lib/minions/data/plunder.js';
import { SkillsEnum } from '@/lib/skilling/types.js';
import type { PlunderActivityTaskOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

export const plunderTask: MinionTask = {
	type: 'Plunder',
	async run(data: PlunderActivityTaskOptions) {
		const { channelID, quantity, rooms, userID, duration } = data;
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

		const flappyRes = await userHasFlappy({ user, duration });
		if (flappyRes.shouldGiveBoost) {
			loot.multiply(2);
		}

		const { itemsAdded, previousCL } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});
		const xpRes = await user.addXP({ skillName: SkillsEnum.Thieving, amount: thievingXP, duration: data.duration });

		const str = `${user}, ${user.minionName} finished doing the Pyramid Plunder ${quantity}x times. ${totalAmountUrns}x urns opened. ${xpRes}  ${flappyRes.userMsg}`;

		const image = await makeBankImage({
			bank: itemsAdded,
			user,
			previousCL,
			title: `Loot From ${quantity}x Pyramid Plunder:`
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, itemsAdded);
	}
};
