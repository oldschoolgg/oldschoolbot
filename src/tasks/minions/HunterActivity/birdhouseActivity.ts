import { calcBirdhouseLimit } from '@/lib/bso/bsoUtil.js';

import { Bank, itemID } from 'oldschooljs';

import type { BirdhouseActivityTaskOptions } from '@/lib/types/minions.js';
import birdhouses from '@/lib/skilling/skills/hunter/birdHouseTrapping.js';
import { roll } from '@oldschoolgg/rng';

const clues = [
	[itemID('Clue scroll(elite)'), 1 / 10],
	[itemID('Clue scroll(hard)'), 2 / 10],
	[itemID('Clue scroll(medium)'), 3 / 10],
	[itemID('Clue scroll(easy)'), 4 / 10]
];

export const birdHouseTask: MinionTask = {
	type: 'Birdhouse',
	async run(data: BirdhouseActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { channelId, placing, gotCraft, birdhouseId, birdhouseName } = data;

		const birdHouseToPlant = birdhouses.find(bh => {
			if (birdhouseId) return bh.birdhouseItem === birdhouseId;
			if (birdhouseName) return bh.name === birdhouseName;
			return false;
		})!;
		const birdhouseData = user.fetchBirdhouseData();

		const birdhouseToCollect = birdhouses.find(bh => {
			if (typeof birdhouseData.lastPlaced === 'number') return bh.birdhouseItem === birdhouseData.lastPlaced;
			return bh.name === birdhouseData.lastPlaced;
		})!;

		const birdHouseLimit = calcBirdhouseLimit(user);
		let hunterXP = 0;
		let craftingXP = 0;
		const strungRabbitFoot = user.hasEquipped('Strung rabbit foot');
		const loot = new Bank();

		if (!placing || !gotCraft) {
			loot.add('Clockwork', birdHouseLimit);
		}

		if (!birdhouseData.birdhousePlaced) {
			let str = `${user}, ${user.minionName} finished placing ${birdHouseLimit}x ${birdHouseToPlant.name}. `;

			if (placing && gotCraft) {
				craftingXP = birdHouseToPlant.craftXP * birdHouseLimit;
				str += await user.addXP({
					skillName: 'crafting',
					amount: craftingXP,
					duration: data.duration,
					source: 'Birdhouses'
				});
			}

			await user.updateBirdhouseData({
				lastPlaced: birdHouseToPlant.birdhouseItem,
				birdhousePlaced: true,
				birdhouseTime: Date.now()
			});

			str += `\n\n${user.minionName} tells you to come back after your birdhouses are full!`;

			return handleTripFinish({ user, channelId, message: str, data });
		}

		let str = '';
		if (placing) {
			str = `${user}, ${user.minionName} finished placing ${birdHouseLimit}x ${birdHouseToPlant.name} and collecting ${birdHouseLimit}x full ${birdhouseToCollect.name}.`;
		} else {
			str = `${user}, ${user.minionName} finished collecting ${birdHouseLimit}x full ${birdhouseToCollect.name}.`;
		}

		for (let i = 0; i < birdHouseLimit; i++) {
			if (!rng.roll(200)) continue;
			let nextTier = false;
			let gotClue = false;
			for (const clue of clues) {
				if (nextTier || rng.randFloat(0, 1) <= clue[1]) {
					if (user.bank.amount(clue[0]) >= 1 || loot.amount(clue[0]) >= 1) {
						nextTier = true;
						continue;
					}
				}
				if (!gotClue && rng.roll(1000)) {
					loot.add('Clue scroll(beginner)');
				}
			}
			if (!gotClue && roll(1000)) {
				loot.add('Clue scroll(beginner)');
			}
		}

		hunterXP = birdhouseToCollect.huntXP * birdHouseLimit;
		for (let i = 0; i < birdHouseLimit; i++) {
			loot.add(birdhouseToCollect.table.roll());
			if (strungRabbitFoot) {
				loot.add(birdhouseToCollect.strungRabbitFootTable.roll());
			} else {
				loot.add(birdhouseToCollect.normalNestTable.roll());
			}
		}
		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		const xpRes = await user.addXP({
			skillName: 'hunter',
			amount: hunterXP,
			duration: data.duration,
			source: 'Birdhouses'
		});

		str += `\n\n${xpRes} from collecting the birdhouses.`;

		if (placing && gotCraft) {
			craftingXP = birdHouseToPlant.craftXP * birdHouseLimit;
			const xpRes = await user.addXP({
				skillName: 'crafting',
				amount: craftingXP,
				duration: data.duration,
				source: 'Birdhouses'
			});
			str += `${xpRes} for making own birdhouses.`;
		}

		str += `\n\nYou received: ${loot}.`;

		if (strungRabbitFoot) {
			str += "\nYour strung rabbit foot necklace increases the chance of receiving bird's eggs and rings.";
		}

		await user.updateBirdhouseData(
			placing
				? {
					lastPlaced: birdHouseToPlant.birdhouseItem,
					birdhousePlaced: true,
					birdhouseTime: Date.now()
				}
				: {
					lastPlaced: null,
					birdhousePlaced: false,
					birdhouseTime: 0
				}
		);

		if (!placing) {
			str += '\nThe birdhouses have been cleared. The birdhouse spots are ready to have new birdhouses.';
		} else {
			str += `\n${user.minionName} tells you to come back after your birdhouses are full!`;
		}

		return handleTripFinish({ user, channelId, message: str, data, loot });
	}
};
