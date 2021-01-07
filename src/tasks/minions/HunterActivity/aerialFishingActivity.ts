import { Task } from 'klasa';
import { AerialFishingActivityTaskOptions } from '../../../lib/types/minions';
import { SkillsEnum } from '../../../lib/skilling/types';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { rand, roll } from '../../../lib/util';
import aerialFishingCreatures from '../../../lib/skilling/skills/hunter/aerialFishing';
import { Bank } from 'oldschooljs';
import createReadableItemListFromBank from '../../../lib/util/createReadableItemListFromTuple';
import { Events, Time } from '../../../lib/constants';

export default class extends Task {
	async run(data: AerialFishingActivityTaskOptions) {
		let { quantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentHuntLevel = user.skillLevel(SkillsEnum.Hunter);
		const currentFishLevel = user.skillLevel(SkillsEnum.Fishing);

		// Current fishable creatures
		const bluegill = aerialFishingCreatures.find(_fish => _fish.name === 'Bluegill');
		const commonTench = aerialFishingCreatures.find(_fish => _fish.name === 'Common tench');
		const mottledEel = aerialFishingCreatures.find(_fish => _fish.name === 'Mottled eel');
		const greaterSiren = aerialFishingCreatures.find(_fish => _fish.name === 'Greater siren');

		if (!bluegill || !commonTench || !mottledEel || !greaterSiren) {
			this.client.wtf(new Error(`one of the aerial fishing creatures couldn't be found.`));
			return;
		}

		let bluegillCaught = 0;
		let commonTenchCaught = 0;
		let mottledEelCaught = 0;
		let greaterSirenCaught = 0;
		let molchPearls = 0;

		// Caught fish and molch pearls received formula
		const maxRoll = (currentFishLevel * 2 + currentHuntLevel) / 3;
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			if (roll((100 - (maxRoll - 40) * 25 / 59))) {
				molchPearls++;
			}
			let currentRoll = rand(0, maxRoll);
			loot.add(bluegill.table.roll());

			if (currentRoll > 82 && currentFishLevel > greaterSiren.fishLvl! && currentHuntLevel > greaterSiren.level!) {
				greaterSirenCaught++;
				continue;
			}
			if (currentRoll > 67 && currentFishLevel > mottledEel.fishLvl! && currentHuntLevel > mottledEel.level!) {
				mottledEelCaught++;
				continue;
			}
			if (currentRoll > 52 && currentFishLevel > commonTench.fishLvl! && currentHuntLevel > commonTench.level!) {
				commonTenchCaught++;
				continue;
			}
			bluegillCaught++;
		}

		loot.add('Molch pearl', molchPearls);

		const huntXpReceived = greaterSirenCaught * greaterSiren.hunterXp + mottledEelCaught * mottledEel.hunterXp + commonTenchCaught * commonTench.hunterXp + bluegillCaught * bluegill.hunterXp;
		const fishXpReceived = greaterSirenCaught * greaterSiren.fishingXp! + mottledEelCaught * mottledEel.fishingXp! + commonTenchCaught * commonTench.fishingXp! + bluegillCaught * bluegill.fishingXp!;

		await user.addXP(SkillsEnum.Fishing, fishXpReceived);
		await user.addXP(SkillsEnum.Agility, huntXpReceived);
		await user.addItemsToBank(loot.values(), true);
		await user.incrementCreatureScore(bluegill.id, bluegillCaught);
		await user.incrementCreatureScore(commonTench.id, commonTenchCaught);
		await user.incrementCreatureScore(mottledEel.id, mottledEelCaught);
		await user.incrementCreatureScore(greaterSiren.id, greaterSirenCaught);

		const newHuntLevel = user.skillLevel(SkillsEnum.Hunter);
		const newFishLevel = user.skillLevel(SkillsEnum.Fishing);

		let str = `${user}, ${user.minionName} finished aerial fishing and caught ${greaterSirenCaught}x ${greaterSiren.name}, ${mottledEelCaught}x ${mottledEel.name}, ${commonTenchCaught}x ${commonTench.name}, ${bluegillCaught}x ${bluegill.name}, you also received ${huntXpReceived.toLocaleString()} Hunter XP and ${fishXpReceived.toLocaleString()} Fishing XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newHuntLevel > currentHuntLevel) {
			str += `\n\n${user.minionName}'s Hunter level is now ${newHuntLevel}!`;
		}

		if (newFishLevel > currentFishLevel) {
			str += `\n\n${user.minionName}'s Fishing level is now ${newFishLevel}!`;
		}

		str += `\n\nYou received: ${await createReadableItemListFromBank(
			this.client,
			loot.values()
		)}.`;

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
				user.log(`continued trip of ${Math.floor(duration / Time.Minute) > user.maxTripLength ? Math.floor(user.maxTripLength / Time.Minute) : Math.floor(duration / Time.Minute)}x minutes Aerial fishing.`);
				return this.client.commands.get('aerialfishing')!.run(res, [Math.floor(duration / Time.Minute) > user.maxTripLength ? Math.floor(user.maxTripLength / Time.Minute) : Math.floor(duration / Time.Minute)]);
			},
			undefined,
			data
		);
	}
}
