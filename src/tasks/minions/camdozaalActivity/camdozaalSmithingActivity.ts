import { calcPercentOfNum } from 'e';
import { randInt, roll } from 'e/dist/lib/chance';
import { Bank, LootTable } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { Emoji, Events } from '../../../lib/constants';
import addSkillingClueToLoot from '../../../lib/minions/functions/addSkillingClueToLoot';
import Fishing from '../../../lib/skilling/skills/fishing';
import { Fish, SkillsEnum } from '../../../lib/skilling/types';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { skillingPetDropRate } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { anglerBoostPercent } from '../../../mahoji/mahojiSettings';

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

export const camdozaalSmithingTask: MinionTask = {
	type: 'CamdozaalSmithing',
	async run(data: ActivityTaskOptionsWithQuantity) {
		let { quantity, userID, channelID } = data;
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
			camdozaalFishTable.add(cavefish.id);
		}

		let guppyCaught = 0;
		let cavefishCaught = 0;
		let tetraCaught = 0;
		let catfishCaught = 0;
		let barroniteShards = 0;

		// Count fish and barronite shards received
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			let fishingRoll = randInt(1, 5);
			let handleRoll = randInt(1, 10);
			if (handleRoll === 10) {
				loot.add('Barronite handle');
			}
			if (fishingRoll === 5) {
				barroniteShards += 3;
			}
			if (fishingRoll !== 5) {
				const fishCaught = camdozaalFishTable.roll();

				if (fishCaught.has(guppy.id)) {
					guppyCaught++;
					continue;
				}
				if (fishCaught.has(cavefish.id)) {
					cavefishCaught++;
					continue;
				}
				if (fishCaught.has(tetra.id)) {
					tetraCaught++;
					continue;
				}
				if (fishCaught.has(catfish.id)) {
					catfishCaught++;
					continue;
				}
			}
		}
		// Add Barronite shards received and fish caught
		loot.add('Barronite shards', barroniteShards)
			.add(guppy.id, guppyCaught)
			.add(cavefish.id, cavefishCaught)
			.add(tetra.id, tetraCaught)
			.add(catfish.id, catfishCaught);

		let fishXpReceived =
			guppyCaught * guppy.xp! +
			cavefishCaught * cavefish.xp! +
			tetraCaught * tetra.xp! +
			catfishCaught * catfish.xp!;

		let bonusXP = 0;

		// If they have the entire angler outfit, give an extra 2.5% xp bonus
		if (
			user.gear.skilling.hasEquipped(
				Object.keys(Fishing.anglerItems).map(i => parseInt(i)),
				true
			)
		) {
			const amountToAdd = Math.floor(fishXpReceived * (2.5 / 100));
			fishXpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each angler item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Fishing.anglerItems)) {
				if (user.hasEquipped(parseInt(itemID))) {
					const amountToAdd = Math.floor(fishXpReceived * (bonus / 100));
					fishXpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		// Add xp to user
		await user.addXP({ skillName: SkillsEnum.Fishing, amount: fishXpReceived, source: 'CamdozaalFishing' });

		// Not sure if there is an fish score? ie. await user.incrementCreatureScore(bluegill.id, bluegillCaught);

		const newFishLevel = user.skillLevel(SkillsEnum.Fishing);

		const xpBonusPercent = anglerBoostPercent(user);
		if (xpBonusPercent > 0) {
			bonusXP += Math.ceil(calcPercentOfNum(xpBonusPercent, fishXpReceived));
		}

		let str = `${user}, ${
			user.minionName
		} finished fishing in Camdozzal! You received ${barroniteShards}x Barronite shards and caught ${catfishCaught}x ${
			catfish.name
		}, ${tetraCaught}x ${tetra.name}, ${cavefishCaught}x ${cavefish.name}, ${guppyCaught}x ${
			guppy.name
		}, you also received ${fishXpReceived.toLocaleString()} Fishing XP.`;

		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		if (newFishLevel > currentFishLevel) {
			str += `\n\n${user.minionName}'s Fishing level is now ${newFishLevel}!`;
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
				`${Emoji.Fishing} **${user.badgedUsername}'s** minion, ${user.minionName}, just received a **Heron** while Aerial fishing at level ${currentFishLevel} Fishing!`
			);
		}

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});
		str += `\n\nYou received: ${loot}.`;

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
