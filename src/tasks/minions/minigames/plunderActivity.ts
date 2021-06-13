import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { lootRoom, plunderRooms } from '../../../lib/minions/data/plunder';
import { SkillsEnum } from '../../../lib/skilling/types';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { PlunderActivityTaskOptions } from './../../../lib/types/minions';

export default class extends Task {
	async run(data: PlunderActivityTaskOptions) {
		const { channelID, quantity, rooms, userID } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinigameScore('PyramidPlunder', quantity);
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

		if (user.usingPet('Flappy')) {
			loot.multiply(2);
		}

		await user.addItemsToBank(loot, true);
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Thieving,
			amount: thievingXP
		});

		let str = `${user}, ${
			user.minionName
		} finished doing the Pyramid Plunder ${quantity}x times. ${totalAmountUrns}x urns opened. ${xpRes}  ${
			user.usingPet('Flappy')
				? ` \n\n<:flappy:812280578195456002> Flappy helps you in your minigame, granting you 2x rewards.`
				: ''
		}`;

		const { image } = await this.client.tasks
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
			image!,
			data,
			loot.bank
		);
	}
}
