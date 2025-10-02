import { userHasFlappy } from '@/lib/bso/skills/invention/inventions.js';

import { roll } from '@oldschoolgg/rng';
import { Bank, GrandHallowedCoffin } from 'oldschooljs';

import { trackLoot } from '@/lib/lootTrack.js';
import { openCoffin, sepulchreFloors } from '@/lib/minions/data/sepulchre.js';
import { zeroTimeFletchables } from '@/lib/skilling/skills/fletching/fletchables/index.js';
import type { SepulchreActivityTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

export const sepulchreTask: MinionTask = {
	type: 'Sepulchre',
	async run(data: SepulchreActivityTaskOptions, { user, handleTripFinish }) {
		const { channelID, quantity, floors, duration, fletch } = data;

		await user.incrementMinigameScore('sepulchre', quantity);

		const completedFloors = sepulchreFloors.filter(fl => floors.includes(fl.number));
		const loot = new Bank();
		let agilityXP = 0;
		let thievingXP = 0;
		let numCoffinsOpened = 0;

		const highestCompletedFloor = completedFloors.reduce((prev, next) => (prev.number > next.number ? prev : next));
		for (let i = 0; i < quantity; i++) {
			for (const floor of completedFloors) {
				if (floor.number >= 5) {
					loot.add(GrandHallowedCoffin.roll(), { 5: 1, 6: 2, 7: 3 }[floor.number] ?? 1);
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
		let fletchXpReceived = 0;
		let fletchXpRes = '';
		let fletchQuantity = 0;
		const fletchingLoot = new Bank();

		let fletchable: (typeof zeroTimeFletchables)[number] | undefined;

		if (fletch) {
			fletchable = zeroTimeFletchables.find(item => item.id === fletch.id);

			if (!fletchable) {
				throw new Error(`Fletchable id ${fletch.id} not found.`);
			}

			fletchQuantity = fletch.qty;

			const quantityToGive = fletchable.outputMultiple
				? fletchQuantity * fletchable.outputMultiple
				: fletchQuantity;

			fletchXpReceived = fletchQuantity * fletchable.xp;

			fletchXpRes = await user.addXP({
				skillName: 'fletching',
				amount: fletchXpReceived,
				duration
			});
			fletchingLoot.add(fletchable.id, quantityToGive);
		}

		const flappyRes = await userHasFlappy({ user, duration });
		if (flappyRes.shouldGiveBoost) {
			loot.multiply(2);
		}

		const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		const xpRes = await user.addXP({
			skillName: 'agility',
			amount: agilityXP,
			duration
		});

		const thievingXpRes = await user.addXP({
			skillName: 'thieving',
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

		let str = `${user}, ${user.minionName} finished doing the Hallowed Sepulchre ${quantity}x times (floor ${
			floors[0]
		}-${floors[floors.length - 1]}), and opened ${numCoffinsOpened}x coffins.\n\n${xpRes}\n${thievingXpRes}`;

		str += `\n${flappyRes.userMsg}`;

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Hallowed Sepulchre`,
			user,
			previousCL
		});

		// Handle fletching loot separately after generating the main loot image
		if (fletchable && fletch) {
			await user.transactItems({
				collectionLog: true,
				itemsToAdd: fletchingLoot
			});

			if (fletchable.outputMultiple) {
				const fletchableName = `${fletchable.name}s`;
				str += `\nYou also fletched ${fletchQuantity} sets of ${fletchableName} and received ${fletchingLoot}. ${fletchXpRes}.`;
			} else {
				str += `\nYou also fletched ${fletchQuantity} ${fletchable.name} and received ${fletchXpRes}.`;
			}
		}

		handleTripFinish(user, channelID, str, image.file.attachment, data, itemsAdded);
	}
};
