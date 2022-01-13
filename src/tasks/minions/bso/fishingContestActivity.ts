import { roll } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { MysteryBoxes } from '../../../lib/data/openables';
import { catchFishAtLocation, fishingLocations } from '../../../lib/fishingContest';
import { prisma } from '../../../lib/settings/prisma';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { ClueTable } from '../../../lib/simulation/sharedTables';
import { SkillsEnum } from '../../../lib/skilling/types';
import { FishingContestOptions } from '../../../lib/types/minions';
import { updateBankSetting } from '../../../lib/util';
import getOSItem from '../../../lib/util/getOSItem';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export function calculateFishingContestXP({ fishingLevel, fishSizeCM }: { fishSizeCM: number; fishingLevel: number }) {
	let fishingXP = (fishSizeCM + 100) * (170 + Math.min(100, fishingLevel) / 5);
	fishingXP -= (100 - Math.min(100, fishingLevel + 1)) * 390;

	return Math.max(1333, Math.ceil(fishingXP));
}

export default class extends Task {
	async run(data: FishingContestOptions) {
		const { channelID, quantity, userID, location, duration } = data;
		const user = await this.client.fetchUser(userID);

		await incrementMinigameScore(userID, 'fishing_contest', quantity);
		const fishLocation = fishingLocations.find(i => i.id === location)!;

		let caughtFish = [];
		for (let i = 0; i < quantity; i++) {
			const fish = await catchFishAtLocation({ user, location: fishLocation });
			caughtFish.push(fish);
		}
		caughtFish.sort((a, b) => b.lengthCentimetres - a.lengthCentimetres);
		await prisma.fishingContestCatch.createMany({
			data: caughtFish.map(f => ({
				name: f.name,
				user_id: BigInt(user.id),
				length_cm: f.lengthCentimetres
			}))
		});

		const loot = new Bank();
		let tackleBoxChance = user.hasItemEquippedAnywhere('Fishing master cape') ? 2 : 3;
		if (roll(tackleBoxChance)) {
			for (const [tackleBox, fishLevel] of [
				['Basic tackle box', 75],
				['Standard tackle box', 85],
				['Professional tackle box', 90],
				["Champion's tackle box", 110]
			] as const) {
				const item = getOSItem(tackleBox);
				if (user.skillLevel(SkillsEnum.Fishing) < fishLevel) break;
				if (user.hasItemEquippedOrInBank(item.id)) continue;

				loot.add(tackleBox);
				break;
			}
		}

		loot.add(roll(2) ? ClueTable.roll() : MysteryBoxes.roll());

		await user.addItemsToBank(loot, true);

		let fishingXP = calculateFishingContestXP({
			fishSizeCM: caughtFish[0].lengthCentimetres,
			fishingLevel: user.skillLevel(SkillsEnum.Fishing)
		});

		let xpStr = await user.addXP({
			skillName: SkillsEnum.Fishing,
			amount: fishingXP,
			duration
		});

		await updateBankSetting(this.client, ClientSettings.EconomyStats.FishingContestLoot, loot);

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${user.minionName} finished fishing at ${fishLocation.name}, you caught: ${caughtFish
				.map(i => `${i.name}(${i.lengthMetres}m, ${i.weightKG.toFixed(1)}KG)`)
				.join(', ')}. You received: ${loot}.
${caughtFish[0].boosts.length > 0 ? `**Boosts:** ${caughtFish[0].boosts.join(', ')}` : ''}
${xpStr}`,
			undefined,
			undefined,
			data,
			loot
		);
	}
}
