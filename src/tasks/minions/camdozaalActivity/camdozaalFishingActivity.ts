import { Bank, LootTable } from 'oldschooljs';

import { Emoji, Events } from '../../../lib/constants';
import addSkillingClueToLoot from '../../../lib/minions/functions/addSkillingClueToLoot';
import Fishing from '../../../lib/skilling/skills/fishing';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { roll, skillingPetDropRate } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';

export const camdozaalFishingTask: MinionTask = {
	type: 'CamdozaalFishing',
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { userID, channelID, quantity, duration } = data;
		const user = await mUserFetch(userID);
		const currentFishLevel = user.skillLevel(SkillsEnum.Fishing);

		// Fish types inside camdozaal
		const guppy = Fishing.camdozaalFishes.find(_fish => _fish.name === 'Raw guppy')!;
		const cavefish = Fishing.camdozaalFishes.find(_fish => _fish.name === 'Raw cavefish')!;
		const tetra = Fishing.camdozaalFishes.find(_fish => _fish.name === 'Raw tetra')!;
		const catfish = Fishing.camdozaalFishes.find(_fish => _fish.name === 'Raw catfish')!;

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

		let guppyCaught = 0;
		let cavefishCaught = 0;
		let tetraCaught = 0;
		let catfishCaught = 0;

		// Count loot received during trip
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			const fishCaught = camdozaalFishTable.roll();
			if (fishCaught.has(guppy.id)) {
				guppyCaught++;
				loot.add(guppy.id);
			} else if (fishCaught.has(cavefish.id)) {
				cavefishCaught++;
				loot.add(cavefish.id);
			} else if (fishCaught.has(tetra.id)) {
				tetraCaught++;
				loot.add(tetra.id);
			} else if (fishCaught.has(catfish.id)) {
				catfishCaught++;
				loot.add(catfish.id);
			} else {
				loot.add(fishCaught);
			}
		}

		// Add up the xp from the trip
		let fishingXpReceived =
			guppyCaught * guppy.xp! +
			cavefishCaught * cavefish.xp! +
			tetraCaught * tetra.xp! +
			catfishCaught * catfish.xp!;
		let bonusXP = 0;

		// If user has the entire angler outfit, give an extra 2.5% xp bonus
		if (
			user.gear.skilling.hasEquipped(
				Object.keys(Fishing.anglerItems).map(i => Number.parseInt(i)),
				true
			)
		) {
			const amountToAdd = Math.floor(fishingXpReceived * (2.5 / 100));
			fishingXpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each angler item, check if they have it, give its' XP boost
			for (const [itemID, bonus] of Object.entries(Fishing.anglerItems)) {
				if (user.hasEquipped(Number.parseInt(itemID))) {
					const amountToAdd = Math.floor(fishingXpReceived * (bonus / 100));
					fishingXpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		// Add xp to user
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Fishing,
			amount: fishingXpReceived,
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
		addSkillingClueToLoot(user, SkillsEnum.Fishing, quantity, clueScrollChance, loot);

		// Heron Pet roll
		const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Fishing, guppy.petChance!);
		if (roll(petDropRate / quantity)) {
			loot.add('Heron');
			str += "\nYou have a funny feeling you're being followed...";
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Fishing} **${user.usernameOrMention}'s** minion, ${user.minionName}, just received a Heron while fishing in Camdozaal at level ${currentFishLevel} Fishing!`
			);
		}

		// Give the user the items from the trip
		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
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
