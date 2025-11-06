import { roll } from '@oldschoolgg/rng';
import { Bank, itemID } from 'oldschooljs';

import birdhouses from '@/lib/skilling/skills/hunter/birdHouseTrapping.js';
import type { BirdhouseActivityTaskOptions } from '@/lib/types/minions.js';
import { calcBirdhouseLimit } from '@/mahoji/lib/abstracted_commands/birdhousesCommand.js';

const clues = [
	[itemID('Clue scroll(elite)'), 1 / 10],
	[itemID('Clue scroll(hard)'), 2 / 10],
	[itemID('Clue scroll(medium)'), 3 / 10],
	[itemID('Clue scroll(easy)'), 4 / 10]
];

export const birdHouseTask: MinionTask = {
	type: 'Birdhouse',
	async run(data: BirdhouseActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { channelId, placing, gotCraft } = data;

		const birdhouseData = user.fetchBirdhouseData();
		if (!birdhouseData.birdhouse || !birdhouseData.lastPlaced) {
			throw new Error(`${user.id} has no birdhouses planted?`);
		}

		const birdHouseLimit = calcBirdhouseLimit();
		let hunterXP = 0;
		let craftingXP = 0;
		const strungRabbitFoot = user.hasEquipped('Strung rabbit foot');
		const loot = new Bank();

		if (!placing || !gotCraft) {
			loot.add('Clockwork', birdHouseLimit);
		}

		if (!birdhouseData.birdhousePlaced) {
			let str = `${user}, ${user.minionName} finished placing ${birdHouseLimit}x ${birdhouseData.birdhouse.name}.`;

			if (placing && gotCraft) {
				craftingXP = birdhouseData.birdhouse.craftXP * birdHouseLimit;
				str += await user.addXP({
					skillName: 'crafting',
					amount: craftingXP,
					duration: data.duration,
					source: 'Birdhouses'
				});
			}

			await user.updateBirdhouseData({
				lastPlaced: birdhouseData.birdhouse.name,
				birdhousePlaced: true,
				birdhouseTime: Date.now()
			});

			str += `\n\n${user.minionName} tells you to come back after your birdhouses are full!`;

			return handleTripFinish({ user, channelId, message: str, data });
		}

		let str = '';
		const birdhouseToCollect = birdhouses.find(_birdhouse => _birdhouse.name === birdhouseData.lastPlaced);
		if (!birdhouseToCollect) return;
		if (placing) {
			str = `${user}, ${user.minionName} finished placing ${birdHouseLimit}x ${birdhouseData.birdhouse.name} and collecting ${birdHouseLimit}x full ${birdhouseToCollect.name}.`;
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
					gotClue = true;
					loot.add(clue[0]);
					break;
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
			craftingXP = birdhouseData.birdhouse.craftXP * birdHouseLimit;
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
						lastPlaced: birdhouseData.birdhouse.name,
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
