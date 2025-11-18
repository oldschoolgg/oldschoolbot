import type { FishingContestOptions } from '@/lib/bso/bsoTypes.js';
import { catchFishAtLocation, fishingLocations } from '@/lib/bso/minigames/fishingContest.js';
import { MysteryBoxes } from '@/lib/bso/openables/tables.js';
import { ClueTable } from '@/lib/bso/tables/sharedTables.js';

import { roll } from '@oldschoolgg/rng';
import { calcPercentOfNum } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';

import { trackLoot } from '@/lib/lootTrack.js';

export function calculateFishingContestXP({ fishingLevel, fishSizeCM }: { fishSizeCM: number; fishingLevel: number }) {
	let fishingXP = (fishSizeCM + 100) * (170 + Math.min(100, fishingLevel) / 5);
	fishingXP -= (100 - Math.min(100, fishingLevel + 1)) * 390;

	return Math.max(1333, Math.ceil(fishingXP));
}

export const fishingContestTask: MinionTask = {
	type: 'FishingContest',
	async run(data: FishingContestOptions, { user, handleTripFinish }) {
		const { channelId, quantity, location, duration } = data;

		const { newScore } = await user.incrementMinigameScore('fishing_contest', 1);
		const fishLocation = fishingLocations.find(i => i.id === location)!;

		const caughtFish = [];
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
		const tackleBoxChance = user.hasEquipped('Fishing master cape') ? 2 : 3;
		if (roll(tackleBoxChance)) {
			for (const [tackleBox, fishLevel] of [
				['Basic tackle box', 75],
				['Standard tackle box', 85],
				['Professional tackle box', 90],
				["Champion's tackle box", 110]
			] as const) {
				const item = Items.getOrThrow(tackleBox);
				if (user.skillLevel('fishing') < fishLevel) break;
				if (user.hasEquippedOrInBank(item.id)) continue;

				loot.add(tackleBox);
				break;
			}
		}
		if (roll(tackleBoxChance)) {
			for (const piece of ['Fishing hat', 'Fishing jacket', 'Fishing waders', 'Fishing boots']) {
				if (!user.hasEquippedOrInBank(piece)) {
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

		const fishingXP = calculateFishingContestXP({
			fishSizeCM: caughtFish[0].lengthCentimetres,
			fishingLevel: user.skillLevel('fishing')
		});

		const xpStr = await user.addXP({
			skillName: 'fishing',
			amount: fishingXP,
			duration
		});

		await ClientSettings.updateBankSetting('fc_loot', loot);

		await trackLoot({
			totalLoot: loot,
			id: 'fishing_contest',
			type: 'Minigame',
			changeType: 'loot',
			duration,
			kc: 1,
			users: [
				{
					id: user.id,
					loot,
					duration
				}
			]
		});

		const message = `${user}, ${user.minionName} finished fishing at ${fishLocation.name}, you caught: ${caughtFish
			.map(i => `${i.name}(${i.lengthMetres}m, ${i.weightKG.toFixed(1)}KG)`)
			.join(', ')}. You received: ${loot}.
${caughtFish[0].boosts.length > 0 ? `**Boosts:** ${caughtFish[0].boosts.join(', ')}` : ''}
${xpStr}`;
		return handleTripFinish({
			user,
			channelId,
			message,
			data,
			loot
		});
	}
};
