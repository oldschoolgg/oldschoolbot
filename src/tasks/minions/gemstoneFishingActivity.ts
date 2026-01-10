import { calcPercentOfNum, Emoji, Events } from '@oldschoolgg/toolkit';
import { LootTable } from 'oldschooljs';

import addSkillingClueToLoot from '@/lib/minions/functions/addSkillingClueToLoot.js';
import type { GemstoneFish } from '@/lib/skilling/skills/fishing/fishing.js';
import { Fishing } from '@/lib/skilling/skills/fishing/fishing.js';
import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { skillingPetDropRate } from '@/lib/util.js';

const juvenileGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Juvenile gemscale')!;
const adolescentGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Adolescent gemscale')!;
const matureGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Mature gemscale')!;
const elderGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Elder gemscale')!;
const ancientGemscale = Fishing.gemstoneFishes.find((fish: GemstoneFish) => fish.name === 'Ancient gemscale')!;

function generateGemstoneFishTable(currentFishLevel: number): LootTable {
	const gemstoneFishTable = new LootTable().add(juvenileGemscale.id, 1, 5);

	if (currentFishLevel >= adolescentGemscale.level) {
		gemstoneFishTable.add(adolescentGemscale.id, 1, 4);
	}
	if (currentFishLevel >= matureGemscale.level) {
		gemstoneFishTable.add(matureGemscale.id, 1, 3);
	}
	if (currentFishLevel >= elderGemscale.level) {
		gemstoneFishTable.add(elderGemscale.id, 1, 2);
	}
	if (currentFishLevel >= ancientGemscale.level) {
		gemstoneFishTable.add(ancientGemscale.id, 1, 1);
	}

	return gemstoneFishTable;
}

export const gemstoneFishingTask: MinionTask = {
	type: 'GemstoneFishing',
	async run(data: ActivityTaskOptionsWithQuantity, { user, handleTripFinish, rng }) {
		const { channelId, quantity, duration } = data;
		const currentFishLevel = user.skillsAsLevels.fishing;

		const gemstoneFishTable = generateGemstoneFishTable(currentFishLevel);

		let fishingXP = 0;
		const loot = gemstoneFishTable.roll(quantity);

		for (const fish of Fishing.gemstoneFishes) {
			fishingXP += loot.amount(fish.id) * fish.xp;
		}

		let bonusXP = 0;

		const anglerBoostPercent = Fishing.util.calcAnglerBoostPercent(user.gearBank);
		if (anglerBoostPercent > 0) {
			const amountToAdd = Math.ceil(calcPercentOfNum(anglerBoostPercent, fishingXP));
			fishingXP += amountToAdd;
			bonusXP += amountToAdd;
		}

		const xpRes = await user.addXP({
			skillName: 'fishing',
			amount: fishingXP,
			duration,
			source: 'GemstoneFishing'
		});

		let str = `${user}, ${user.minionName} finished fishing for gemscales! ${xpRes}`;

		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		const clueScrollChance = juvenileGemscale.clueScrollChance!;
		addSkillingClueToLoot(user, 'fishing', quantity, clueScrollChance, loot);

		const { petDropRate } = skillingPetDropRate(user, 'fishing', juvenileGemscale.petChance!);
		if (rng.roll(Math.ceil(petDropRate / quantity))) {
			loot.add('Heron');
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Fishing} **${user.usernameOrMention}'s** minion, ${user.minionName}, just received a Heron while fishing for gemscales at level ${currentFishLevel} Fishing!`
			);
		}

		const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Gemstone Fishing`,
			user,
			previousCL
		});

		handleTripFinish({ user, channelId, message: { content: str, files: [image] }, data, loot });
	}
};
