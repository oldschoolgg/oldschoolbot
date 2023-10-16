import { randInt } from 'e';
import { Bank, LootTable } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { Emoji, Events } from '../../../lib/constants';
import addSkillingClueToLoot from '../../../lib/minions/functions/addSkillingClueToLoot';
import Fishing from '../../../lib/skilling/skills/fishing';
import { Fish, SkillsEnum } from '../../../lib/skilling/types';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { roll, skillingPetDropRate } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';

// Types of fish in camdozaal
const camdozaalFishes: Fish[] = [
	{
		level: 7,
		xp: 8,
		id: itemID('Raw guppy'),
		name: 'Raw guppy',
		timePerFish: 1
	},
	{
		level: 20,
		xp: 16,
		id: itemID('Raw cavefish'),
		name: 'Raw cavefish',
		timePerFish: 1
	},
	{
		level: 33,
		xp: 24,
		id: itemID('Raw tetra'),
		name: 'Raw tetra',
		timePerFish: 1
	},
	{
		level: 46,
		xp: 33,
		id: itemID('Raw catfish'),
		name: 'Raw catfish',
		timePerFish: 1
	}
];

export const camdozaalFishingTask: MinionTask = {
	type: 'CamdozaalFishing',
	async run(data: ActivityTaskOptionsWithQuantity) {
		let { userID, channelID, quantity, duration } = data;
		const user = await mUserFetch(userID);
		const currentFishLevel = user.skillLevel(SkillsEnum.Fishing);

		// Fish types inside camdozaal
		const guppy = camdozaalFishes.find(_fish => _fish.name === 'Raw guppy')!;
		const cavefish = camdozaalFishes.find(_fish => _fish.name === 'Raw cavefish')!;
		const tetra = camdozaalFishes.find(_fish => _fish.name === 'Raw tetra')!;
		const catfish = camdozaalFishes.find(_fish => _fish.name === 'Raw catfish')!;

		// Loot table based on users fishing level
		const camdozaalFishTable = new LootTable();
		if (currentFishLevel >= guppy.level) {
			camdozaalFishTable.add(guppy.id);
		}
		if (currentFishLevel >= cavefish.level) {
			camdozaalFishTable.add(cavefish.id);
		}
		if (currentFishLevel >= tetra.level) {
			camdozaalFishTable.add(tetra.id);
		}
		if (currentFishLevel >= catfish.level) {
			camdozaalFishTable.add(catfish.id);
		}

		let guppyCaught = 0;
		let cavefishCaught = 0;
		let tetraCaught = 0;
		let catfishCaught = 0;
		let barroniteShards = 0;

		// Count loot received during trip
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			let fishingRoll = randInt(1, 5);
			if (roll(250)) {
				loot.add('Barronite handle');
			}
			if (fishingRoll === 5) {
				barroniteShards += 3;
			} else {
				const fishCaught = camdozaalFishTable.roll();
				if (fishCaught.has(guppy.id)) {
					guppyCaught++;
				  } else if (fishCaught.has(cavefish.id)) {
					cavefishCaught++;
				  } else if (fishCaught.has(tetra.id)) {
					tetraCaught++;
				  } else if (fishCaught.has(catfish.id)) {
					catfishCaught++;
			}
		}

		// Add Barronite shards & fish from trip
		loot.add('Barronite shards', barroniteShards)
			.add(guppy.id, guppyCaught)
			.add(cavefish.id, cavefishCaught)
			.add(tetra.id, tetraCaught)
			.add(catfish.id, catfishCaught);

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
				Object.keys(Fishing.anglerItems).map(i => parseInt(i)),
				true
			)
		) {
			const amountToAdd = Math.floor(fishingXpReceived * (2.5 / 100));
			fishingXpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each angler item, check if they have it, give its' XP boost
			for (const [itemID, bonus] of Object.entries(Fishing.anglerItems)) {
				if (user.hasEquipped(parseInt(itemID))) {
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
		let str = `${user}, ${user.minionName} finished fishing in Camdozzal! ${xpRes}`;
		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		// Add clue scrolls
		const clueScrollChance = 257_770;
		addSkillingClueToLoot(user, SkillsEnum.Fishing, quantity, clueScrollChance, loot);

		// Heron Pet roll
		const totalFishCaught = catfishCaught + tetraCaught + cavefishCaught + guppyCaught;
		const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Fishing, 257_770);
		if (roll(petDropRate / totalFishCaught)) {
			loot.add('Heron');
			str += "\nYou have a funny feeling you're being followed...";
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Fishing} **${user.badgedUsername}'s** minion, ${user.minionName}, just received a **Heron** while Fishing in Camdozaal at level ${currentFishLevel} Fishing!`
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
