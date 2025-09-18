import { Emoji, Events } from '@oldschoolgg/toolkit/constants';
import { calcPercentOfNum } from 'e';
import { LootTable } from 'oldschooljs';

import addSkillingClueToLoot from '@/lib/minions/functions/addSkillingClueToLoot';
import { Fishing } from '@/lib/skilling/skills/fishing/fishing';
import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions';
import { skillingPetDropRate } from '@/lib/util';
import { handleTripFinish } from '@/lib/util/handleTripFinish';
import { makeBankImage } from '@/lib/util/makeBankImage';
import { roll } from '@/lib/util/rng';

const guppy = Fishing.camdozaalFishes.find(_fish => _fish.name === 'Raw guppy')!;
const cavefish = Fishing.camdozaalFishes.find(_fish => _fish.name === 'Raw cavefish')!;
const tetra = Fishing.camdozaalFishes.find(_fish => _fish.name === 'Raw tetra')!;
const catfish = Fishing.camdozaalFishes.find(_fish => _fish.name === 'Raw catfish')!;

function generateFishTable(currentFishLevel: number): LootTable {
	// Loot table based on users fishing level
	const camdozaalFishTable = new LootTable()
		.oneIn(256, 'Barronite handle')
		.oneIn(5, 'Barronite shards', 3)
		.add(guppy.id, 1, 4);

	if (currentFishLevel >= cavefish.level) {
		camdozaalFishTable.add(cavefish.id, 1, 3);
	}
	if (currentFishLevel >= tetra.level) {
		camdozaalFishTable.add(tetra.id, 1, 2);
	}
	if (currentFishLevel >= catfish.level) {
		camdozaalFishTable.add(catfish.id, 1, 1);
	}
	return camdozaalFishTable;
}

export const camdozaalFishingTask: MinionTask = {
	type: 'CamdozaalFishing',
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { userID, channelID, quantity, duration } = data;
		const user = await mUserFetch(userID);
		const currentFishLevel = user.skillsAsLevels.fishing;

		const camdozaalFishTable = generateFishTable(currentFishLevel);

		let fishingXP = 0;

		const loot = camdozaalFishTable.roll(quantity);
		for (const fish of Fishing.camdozaalFishes) {
			fishingXP += loot.amount(fish.id) * fish.xp;
		}

		let bonusXP = 0;

		const anglerBoostPercent = Fishing.util.calcAnglerBoostPercent(user.gearBank);
		if (anglerBoostPercent > 0) {
			const amountToAdd = Math.ceil(calcPercentOfNum(anglerBoostPercent, fishingXP));
			fishingXP += amountToAdd;
			bonusXP += amountToAdd;
		}

		// Add xp to user
		const xpRes = await user.addXP({
			skillName: 'fishing',
			amount: fishingXP,
			duration,
			source: 'CamdozaalFishing'
		});

		// Trip finish message
		let str = `${user}, ${user.minionName} finished fishing in Camdozaal! ${xpRes}`;
		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		// Add clue scrolls
		const clueScrollChance = guppy.clueScrollChance!;
		addSkillingClueToLoot(user, 'fishing', quantity, clueScrollChance, loot);

		// Heron Pet roll
		const { petDropRate } = skillingPetDropRate(user, 'fishing', guppy.petChance!);
		if (roll(petDropRate / quantity)) {
			loot.add('Heron');
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Fishing} **${user.usernameOrMention}'s** minion, ${user.minionName}, just received a Heron while fishing in Camdozaal at level ${currentFishLevel} Fishing!`
			);
		}

		// Give the user the items from the trip
		const { previousCL, itemsAdded } = await user.transactItems({

			collectionLog: true,
			itemsToAdd: loot
		});

		// BankImage to show the user their loot
		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Camdozaal Fishing`,
			user,
			previousCL
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, loot);
	}
};
