import { calcPercentOfNum, roll } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { MysteryBoxes } from '../../../lib/bsoOpenables';
import { catchFishAtLocation, fishingLocations } from '../../../lib/fishingContest';
import { prisma, trackLoot } from '../../../lib/settings/prisma';
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

		const { newScore } = await incrementMinigameScore(userID, 'fishing_contest', 1);
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
		if (roll(tackleBoxChance)) {
			for (const piece of ['Fishing hat', 'Fishing jacket', 'Fishing waders', 'Fishing boots']) {
				if (!user.hasItemEquippedOrInBank(piece)) {
					loot.add(piece);
					break;
				}
			}
		}

		// If they have a fish thats in the top 20% biggest they can catch,
		// or if this is their 100th Fishing Trip,
		// or if they have a 1 in 50 roll,
		// and they don't have one, give them the Golden fishing trophy
		if (
			!user.owns('Golden fishing trophy') &&
			(caughtFish.some(fi => fi.lengthCentimetres >= calcPercentOfNum(80, fi.maxLength)) ||
				newScore === 100 ||
				roll(50))
		) {
			loot.add('Golden fishing trophy');
		}

		loot.add(roll(2) ? ClueTable.roll() : MysteryBoxes.roll());

		await user.addItemsToBank({ items: loot, collectionLog: true });

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

		await trackLoot({
			loot,
			id: 'fishing_contest',
			type: 'Minigame',
			changeType: 'loot',
			duration,
			kc: 1
		});

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
