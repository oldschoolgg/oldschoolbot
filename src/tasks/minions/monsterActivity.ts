import { Task } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';

import killableMonsters from '../../lib/minions/data/killableMonsters';
import { addMonsterXP } from '../../lib/minions/functions';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { getUsersCurrentSlayerInfo } from '../../lib/slayer/slayerUtil';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MonsterActivityTaskOptions) {
		const { monsterID, userID, channelID, quantity, duration } = data;
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;
		const user = await this.client.users.fetch(userID);
		await user.incrementMonsterScore(monsterID, quantity);
		const loot = new Bank(monster.table.kill(quantity));

		announceLoot(this.client, user, monster, loot.bank);
		const usersTask = await getUsersCurrentSlayerInfo(user.id);
		const isOnTask =
			usersTask.assignedTask !== null &&
			usersTask.currentTask !== null &&
			usersTask.assignedTask.monsters.includes(monsterID);
		const quantitySlayed = isOnTask
			? Math.max(usersTask.currentTask!.quantityRemaining, quantity)
			: null;
		const xpRes = await addMonsterXP(
			user,
			monsterID,
			quantity,
			duration,
			isOnTask,
			quantitySlayed
		);

		let str = `${user}, ${user.minionName} finished killing ${quantity} ${monster.name}. Your ${
			monster.name
		} KC is now ${user.getKC(monsterID)}.\n${xpRes}\n`;

		if (
			monster.id === Monsters.Unicorn.id &&
			user.hasItemEquippedAnywhere('Iron dagger') &&
			!user.hasItemEquippedOrInBank('Clue hunter cloak')
		) {
			loot.add('Clue hunter cloak');
			loot.add('Clue hunter boots');

			str += `\n\nWhile killing a Unicorn, you discover some strange clothing in the ground - you pick them up.`;
		}

		if (isOnTask) {
			const quantityLeft = Math.max(
				0,
				usersTask.currentTask!.quantityRemaining - quantitySlayed!
			);
			str += `\nYou killed ${quantitySlayed}x of your ${
				usersTask.currentTask!.quantityRemaining
			} remaining kills, you now have ${quantityLeft} kills remaining.`;
			const thisTripFinishesTask = quantityLeft === 0;
			if (thisTripFinishesTask) {
				str += ` This trip finished your task.`;
			}
			usersTask.currentTask!.quantityRemaining = quantityLeft;
			await usersTask.currentTask!.save();
		}

		const { previousCL, itemsAdded } = await user.addItemsToBank(loot, true);

		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				itemsAdded,
				`Loot From ${quantity} ${monster.name}:`,
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
			res => {
				user.log(`continued trip of killing ${monster.name}`);
				return this.client.commands.get('k')!.run(res, [quantity, monster.name]);
			},
			image!,
			data,
			itemsAdded
		);
	}
}
