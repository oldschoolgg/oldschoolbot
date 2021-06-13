import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity, Emoji, Events, Time } from '../../../lib/constants';
import { hasArrayOfItemsEquipped } from '../../../lib/gear';
import Fishing from '../../../lib/skilling/skills/fishing';
import aerialFishingCreatures from '../../../lib/skilling/skills/hunter/aerialFishing';
import { SkillsEnum } from '../../../lib/skilling/types';
import { AerialFishingActivityTaskOptions } from '../../../lib/types/minions';
import { anglerBoostPercent, calcPercentOfNum, rand, roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: AerialFishingActivityTaskOptions) {
		let { quantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		const currentHuntLevel = user.skillLevel(SkillsEnum.Hunter);
		const currentFishLevel = user.skillLevel(SkillsEnum.Fishing);

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
			let currentRoll = rand(0, maxRoll);
			loot.add(bluegill.table.roll());

			if (
				currentRoll >= 82 &&
				currentFishLevel >= greaterSiren.fishLvl! &&
				currentHuntLevel >= greaterSiren.level!
			) {
				greaterSirenCaught++;
				continue;
			}
			if (
				currentRoll >= 67 &&
				currentFishLevel >= mottledEel.fishLvl! &&
				currentHuntLevel >= mottledEel.level!
			) {
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
			hasArrayOfItemsEquipped(
				Object.keys(Fishing.anglerItems).map(i => parseInt(i)),
				user.getGear('skilling')
			)
		) {
			const amountToAdd = Math.floor(fishXpReceived * (2.5 / 100));
			fishXpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each angler item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Fishing.anglerItems)) {
				if (user.hasItemEquippedAnywhere(parseInt(itemID))) {
					const amountToAdd = Math.floor(fishXpReceived * (bonus / 100));
					fishXpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		await user.addXP({
			skillName: SkillsEnum.Fishing,
			amount: fishXpReceived
		});
		await user.addXP({
			skillName: SkillsEnum.Hunter,
			amount: huntXpReceived
		});
		await user.incrementCreatureScore(bluegill.id, bluegillCaught);
		await user.incrementCreatureScore(commonTench.id, commonTenchCaught);
		await user.incrementCreatureScore(mottledEel.id, mottledEelCaught);
		await user.incrementCreatureScore(greaterSiren.id, greaterSirenCaught);

		const newHuntLevel = user.skillLevel(SkillsEnum.Hunter);
		const newFishLevel = user.skillLevel(SkillsEnum.Fishing);

		const xpBonusPercent = anglerBoostPercent(user);
		if (xpBonusPercent > 0) {
			bonusXP += Math.ceil(calcPercentOfNum(xpBonusPercent, fishXpReceived));
		}

		let str = `${user}, ${
			user.minionName
		} finished aerial fishing and caught ${greaterSirenCaught}x ${
			greaterSiren.name
		}, ${mottledEelCaught}x ${mottledEel.name}, ${commonTenchCaught}x ${
			commonTench.name
		}, ${bluegillCaught}x ${
			bluegill.name
		}, you also received ${huntXpReceived.toLocaleString()} Hunter XP and ${fishXpReceived.toLocaleString()} Fishing XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		if (newHuntLevel > currentHuntLevel) {
			str += `\n\n${user.minionName}'s Hunter level is now ${newHuntLevel}!`;
		}

		if (newFishLevel > currentFishLevel) {
			str += `\n\n${user.minionName}'s Fishing level is now ${newFishLevel}!`;
		}

		// Heron Pet roll
		const totalFishCaught =
			greaterSirenCaught + mottledEelCaught + commonTenchCaught + bluegillCaught;
		if (roll((636_833 - user.skillLevel(SkillsEnum.Fishing) * 25) / totalFishCaught)) {
			loot.add('Heron');
			str += `\nYou have a funny feeling you're being followed...`;
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Fishing} **${user.username}'s** minion, ${user.minionName}, just received a **Heron** while Aerial fishing at level ${currentFishLevel} Fishing!`
			);
		}

		await user.addItemsToBank(loot.values(), true);
		str += `\n\nYou received: ${loot}.`;

		if (loot.amount('Golden tench') > 0) {
			str += `\n\n**The cormorant has brought you a very strange tench.**`;
			this.client.emit(
				Events.ServerNotification,
				`**${user.username}'s** minion, ${user.minionName}, just received a **Golden tench** while aerial fishing, their Fishing/Hunter level is ${currentFishLevel}/${currentHuntLevel}!`
			);
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of Aerial fishing.`);
				return this.client.commands
					.get('aerialfish')!
					.run(res, [
						Math.floor(
							Math.min(
								user.maxTripLength(Activity.AerialFishing) / Time.Minute,
								duration / Time.Minute
							)
						)
					]);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
