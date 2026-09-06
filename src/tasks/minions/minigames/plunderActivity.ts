import { Emoji } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { lootRoom, plunderRooms } from '@/lib/minions/data/plunder.js';
import type { PlunderActivityTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { sendServerNotification } from '@/lib/util/serverNotification.js';

export const plunderTask: MinionTask = {
	type: 'Plunder',
	async run(data: PlunderActivityTaskOptions, { user, handleTripFinish }) {
		const { channelId, quantity, rooms } = data;

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

		if (loot.has('Rocky')) {
			sendServerNotification({
				user,
				item: 'Rocky',
				action: 'doing',
				activity: 'Pyramid Plunder',
				level: user.skillsAsLevels.thieving,
				skill: 'Thieving',
				emoji: Emoji.Thieving
			});
		}

		const { itemsAdded, previousCL } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});
		const xpRes = await user.addXP({ skillName: 'thieving', amount: thievingXP, duration: data.duration });

		const str = `${user}, ${user.minionName} finished doing the Pyramid Plunder ${quantity}x times. ${totalAmountUrns}x urns opened. ${xpRes}`;

		const image = await makeBankImage({
			bank: itemsAdded,
			user,
			previousCL,
			title: `Loot From ${quantity}x Pyramid Plunder:`
		});

		handleTripFinish({ user, channelId, message: { content: str, files: [image] }, data, loot: itemsAdded });
	}
};
