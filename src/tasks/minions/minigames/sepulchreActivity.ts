import { Bank } from 'oldschooljs';
import { GrandHallowedCoffin } from 'oldschooljs/dist/simulation/misc/GrandHallowedCoffin';

import { trackLoot } from '../../../lib/lootTrack';
import { openCoffin, sepulchreFloors } from '../../../lib/minions/data/sepulchre';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { SepulchreActivityTaskOptions } from '../../../lib/types/minions';
import { roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';

export const sepulchreTask: MinionTask = {
	type: 'Sepulchre',
	async run(data: SepulchreActivityTaskOptions) {
		const { channelID, quantity, floors, userID, duration } = data;
		const user = await mUserFetch(userID);
		await incrementMinigameScore(userID, 'sepulchre', quantity);

		const completedFloors = sepulchreFloors.filter(fl => floors.includes(fl.number));
		const loot = new Bank();
		let agilityXP = 0;
		let thievingXP = 0;
		let numCoffinsOpened = 0;

		const highestCompletedFloor = completedFloors.reduce((prev, next) => (prev.number > next.number ? prev : next));
		for (let i = 0; i < quantity; i++) {
			for (const floor of completedFloors) {
				if (floor.number === 5) {
					loot.add(GrandHallowedCoffin.roll());
				}

				const numCoffinsToOpen = 1;
				numCoffinsOpened += numCoffinsToOpen;
				for (let i = 0; i < numCoffinsToOpen; i++) {
					loot.add(openCoffin(floor.number, user));
				}
				agilityXP += floor.xp;
				thievingXP = 200 * numCoffinsOpened;
			}
			if (roll(highestCompletedFloor.petChance)) {
				loot.add('Giant squirrel');
			}
		}

		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Agility,
			amount: agilityXP,
			duration
		});

		const thievingXpRes = await user.addXP({
			skillName: SkillsEnum.Thieving,
			amount: thievingXP,
			duration
		});

		await trackLoot({
			totalLoot: itemsAdded,
			id: 'sepulchre',
			type: 'Minigame',
			changeType: 'loot',
			duration: data.duration,
			kc: quantity,
			users: [
				{
					id: user.id,
					duration,
					loot: itemsAdded
				}
			]
		});

		const str = `${user}, ${user.minionName} finished doing the Hallowed Sepulchre ${quantity}x times (floor ${
			floors[0]
		}-${floors[floors.length - 1]}), and opened ${numCoffinsOpened}x coffins.\n\n${xpRes}\n${thievingXpRes}`;

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Hallowed Sepulchre`,
			user,
			previousCL
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, itemsAdded);
	}
};
