import { calcPercentOfNum, randInt } from '@oldschoolgg/toolkit';
import { Emoji, Events } from '@oldschoolgg/toolkit/constants';
import { Bank } from 'oldschooljs';

import { roll } from '@/lib/util/rng.js';
import addSkillingClueToLoot from '../../../lib/minions/functions/addSkillingClueToLoot.js';
import { Fishing } from '../../../lib/skilling/skills/fishing/fishing.js';
import aerialFishingCreatures from '../../../lib/skilling/skills/hunter/aerialFishing.js';
import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions.js';
import { skillingPetDropRate } from '../../../lib/util.js';

export const aerialFishingTask: MinionTask = {
	type: 'AerialFishing',
	isNew: true,
	async run(data: ActivityTaskOptionsWithQuantity, { user, handleTripFinish }) {
		const { quantity, channelID } = data;
		const currentHuntLevel = user.skillsAsLevels.hunter;
		const currentFishLevel = user.skillsAsLevels.fishing;

		// Current fishable creatures
		const bluegill = aerialFishingCreatures.find(_fish => _fish.name === 'Bluegill')!;
		const commonTench = aerialFishingCreatures.find(_fish => _fish.name === 'Common tench')!;
		const mottledEel = aerialFishingCreatures.find(_fish => _fish.name === 'Mottled eel')!;
		const greaterSiren = aerialFishingCreatures.find(_fish => _fish.name === 'Greater siren')!;

		let bluegillCaught = 0;
		let commonTenchCaught = 0;
		let mottledEelCaught = 0;
		let greaterSirenCaught = 0;
		let molchPearls = 0;

		// Caught fish and molch pearls received formula
		const maxRoll = (currentFishLevel * 2 + currentHuntLevel) / 3;
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			if (roll(100 - ((maxRoll - 40) * 25) / 59)) {
				molchPearls++;
			}
			const currentRoll = randInt(0, maxRoll);
			loot.add(bluegill.table.roll());

			if (
				currentRoll >= 82 &&
				currentFishLevel >= greaterSiren.fishLvl! &&
				currentHuntLevel >= greaterSiren.level!
			) {
				greaterSirenCaught++;
				continue;
			}
			if (currentRoll >= 67 && currentFishLevel >= mottledEel.fishLvl! && currentHuntLevel >= mottledEel.level!) {
				mottledEelCaught++;
				continue;
			}
			if (
				currentRoll >= 52 &&
				currentFishLevel >= commonTench.fishLvl! &&
				currentHuntLevel >= commonTench.level!
			) {
				commonTenchCaught++;
				continue;
			}
			bluegillCaught++;
		}

		loot.add('Molch pearl', molchPearls);

		const huntXpReceived =
			greaterSirenCaught * greaterSiren.hunterXP +
			mottledEelCaught * mottledEel.hunterXP +
			commonTenchCaught * commonTench.hunterXP +
			bluegillCaught * bluegill.hunterXP;
		let fishXpReceived =
			greaterSirenCaught * greaterSiren.fishingXP! +
			mottledEelCaught * mottledEel.fishingXP! +
			commonTenchCaught * commonTench.fishingXP! +
			bluegillCaught * bluegill.fishingXP!;

		let bonusXP = 0;

		// If they have the entire angler outfit, give an extra 2.5% xp bonus
		if (
			user.gear.skilling.hasEquipped(
				Fishing.anglerItems.map(i => i[0]),
				true
			)
		) {
			const amountToAdd = Math.floor(fishXpReceived * (2.5 / 100));
			fishXpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each angler item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Fishing.anglerItems) {
				if (user.hasEquipped(itemID)) {
					const amountToAdd = Math.floor(fishXpReceived * (bonus / 100));
					fishXpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		const fishXP = await user.addXP({
			skillName: 'fishing',
			amount: fishXpReceived,
			duration: data.duration,
			source: 'AerialFishing'
		});
		const huntXP = await user.addXP({
			skillName: 'hunter',
			amount: huntXpReceived,
			duration: data.duration,
			source: 'AerialFishing'
		});
		await user.incrementCreatureScore(bluegill.id, bluegillCaught);
		await user.incrementCreatureScore(commonTench.id, commonTenchCaught);
		await user.incrementCreatureScore(mottledEel.id, mottledEelCaught);
		await user.incrementCreatureScore(greaterSiren.id, greaterSirenCaught);

		const xpBonusPercent = Fishing.util.calcAnglerBoostPercent(user.gearBank);
		if (xpBonusPercent > 0) {
			bonusXP += Math.ceil(calcPercentOfNum(xpBonusPercent, fishXpReceived));
		}

		let str = `${user}, ${user.minionName} finished aerial fishing and caught ${greaterSirenCaught}x ${greaterSiren.name}, ${mottledEelCaught}x ${mottledEel.name}, ${commonTenchCaught}x ${commonTench.name}, ${bluegillCaught}x ${bluegill.name}, ${huntXP}, ${fishXP}. ${user.minionName} asks if you'd like them to do another of the same trip.`;

		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		// Add clue scrolls
		const clueScrollChance = 636_833;
		addSkillingClueToLoot(user, 'fishing', quantity, clueScrollChance, loot);

		// Heron Pet roll
		const totalFishCaught = greaterSirenCaught + mottledEelCaught + commonTenchCaught + bluegillCaught;
		const { petDropRate } = skillingPetDropRate(user, 'fishing', 636_833);
		if (roll(petDropRate / totalFishCaught)) {
			loot.add('Heron');
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Fishing} **${user.badgedUsername}'s** minion, ${user.minionName}, just received a **Heron** while Aerial fishing at level ${currentFishLevel} Fishing!`
			);
		}

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});
		str += `\n\nYou received: ${loot}.`;

		if (loot.amount('Golden tench') > 0) {
			str += '\n\n**The cormorant has brought you a very strange tench.**';
			globalClient.emit(
				Events.ServerNotification,
				`**${user.usernameOrMention}'s** minion, ${user.minionName}, just received a **Golden tench** while aerial fishing, their Fishing/Hunter level is ${currentFishLevel}/${currentHuntLevel}!`
			);
		}

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
