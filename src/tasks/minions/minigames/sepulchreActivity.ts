import { roll } from '@oldschoolgg/rng';
import { Bank, GrandHallowedCoffin, type Item, Items } from 'oldschooljs';

import { trackLoot } from '@/lib/lootTrack.js';
import { openCoffin, sepulchreFloors } from '@/lib/minions/data/sepulchre.js';
import { zeroTimeFletchables } from '@/lib/skilling/skills/fletching/fletchables/index.js';
import type { SepulchreActivityTaskOptions } from '@/lib/types/minions.js';
import { calculateBryophytaRuneSavings } from '@/lib/util/bryophytaRuneSavings.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

export const sepulchreTask: MinionTask = {
	type: 'Sepulchre',
	async run(data: SepulchreActivityTaskOptions) {
		const { channelID, quantity, floors, userID, duration, fletch, alch, zeroTimePreferenceRole } = data;
		const user = await mUserFetch(userID);
		await user.incrementMinigameScore('sepulchre', quantity);

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
		let fletchXpReceived = 0;
		let fletchXpRes = '';
		let fletchQuantity = 0;
		const fletchingLoot = new Bank();
		let alchQuantity = 0;
		let alchItem: Item | null = null;
		let alchXpRes = '';

		let fletchable: (typeof zeroTimeFletchables)[number] | undefined;

		let savedRunesFromAlching = 0;
		if (alch && alch.quantity > 0) {
			alchQuantity = alch.quantity;
			alchItem = Items.get(alch.itemID) ?? null;

			if (!alchItem || !alchItem.highalch) {
				throw new Error(`Alch item id ${alch.itemID} not valid for Sepulchre alching.`);
			}

			const alchGP = alchItem.highalch * alchQuantity;
			if (alchGP > 0) {
				loot.add('Coins', alchGP);
				ClientSettings.updateClientGPTrackSetting('gp_alch', alchGP);
			}

			const { savedRunes, savedBank } = calculateBryophytaRuneSavings({
				user,
				quantity: alchQuantity
			});
			savedRunesFromAlching = savedRunes;
			if (savedBank) {
				loot.add(savedBank);
			}

			alchXpRes = await user.addXP({
				skillName: 'magic',
				amount: alchQuantity * 65,
				duration
			});
		}

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

		const fallbackNote = zeroTimePreferenceRole === 'fallback' ? ' (fallback preference)' : '';
		let str = `${user}, ${user.minionName} finished doing the Hallowed Sepulchre ${quantity}x times (floor ${
			floors[0]
		}-${floors[floors.length - 1]}), and opened ${numCoffinsOpened}x coffins.\n\n${xpRes}\n${thievingXpRes}${
			alchXpRes ? `\n${alchXpRes}` : ''
		}`;

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
				str += `\nYou also fletched ${fletchQuantity} sets of ${fletchableName}${fallbackNote} and received ${fletchingLoot}. ${fletchXpRes}.`;
			} else {
				str += `\nYou also fletched ${fletchQuantity} ${fletchable.name}${fallbackNote} and received ${fletchXpRes}.`;
			}
		}

		if (alchItem && alchQuantity > 0) {
			str += `\nYou also alched ${alchQuantity}x ${alchItem.name}${fallbackNote}.`;
			if (savedRunesFromAlching > 0) {
				str += ` Your Bryophyta's staff saved you ${savedRunesFromAlching} Nature runes.`;
			}
		} else if (savedRunesFromAlching > 0) {
			str += `\nYour Bryophyta's staff saved you ${savedRunesFromAlching} Nature runes.`;
		}

		return handleTripFinish(user, channelID, str, image.file.attachment, data, itemsAdded);
	}
};
