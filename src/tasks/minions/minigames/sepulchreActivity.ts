import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import { GrandHallowedCoffin } from 'oldschooljs/dist/simulation/misc/GrandHallowedCoffin';

import { openCoffin, sepulchreFloors } from '../../../lib/minions/data/sepulchre';
import { trackLoot } from '../../../lib/settings/prisma';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { SepulchreActivityTaskOptions } from '../../../lib/types/minions';
import { roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: SepulchreActivityTaskOptions) {
		const { channelID, quantity, floors, userID } = data;
		const user = await this.client.fetchUser(userID);
		await incrementMinigameScore(userID, 'sepulchre', quantity);

		const completedFloors = sepulchreFloors.filter(fl => floors.includes(fl.number));
		const loot = new Bank();
		let agilityXP = 0;
		let numCoffinsOpened = 0;

		for (let i = 0; i < quantity; i++) {
			for (const floor of completedFloors) {
				if (floor.number === 5) {
					loot.add(GrandHallowedCoffin.roll());
				}

				const numCoffinsToOpen = 1;
				numCoffinsOpened += numCoffinsToOpen;
				for (let i = 0; i < numCoffinsToOpen; i++) {
					loot.add(openCoffin(floor.number, user.cl()));
				}

				agilityXP += floor.xp;
			}
			if (roll(completedFloors[completedFloors.length - 1].petChance)) {
				loot.add('Giant squirrel');
			}
		}

		const { previousCL, itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: true });
		const xpStr = await user.addXP({ skillName: SkillsEnum.Agility, amount: agilityXP });

		await trackLoot({
			loot: itemsAdded,
			id: 'sepulchre',
			type: 'Minigame',
			changeType: 'loot',
			duration: data.duration,
			kc: quantity
		});

		let str = `${user}, ${user.minionName} finished doing the Hallowed Sepulchre ${quantity}x times (floor ${
			floors[0]
		}-${floors[floors.length - 1]}), and opened ${numCoffinsOpened}x coffins.\n\n${xpStr}`;

		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				itemsAdded,
				`Loot From ${quantity}x Hallowed Sepulchre:`,
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
			['minigames', { sepulchre: { start: {} } }, true],
			image!,
			data,
			itemsAdded
		);
	}
}
