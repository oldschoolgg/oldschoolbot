import type { RNGProvider } from '@oldschoolgg/rng';
import { calcPercentOfNum } from '@oldschoolgg/toolkit';
import { EItem } from 'oldschooljs';
import { match } from 'ts-pattern';

import addSkillingClueToLoot from '@/lib/minions/functions/addSkillingClueToLoot.js';
import type { Fish } from '@/lib/skilling/types.js';
import type { GearBank } from '@/lib/structures/GearBank.js';
import { UpdateBank } from '@/lib/structures/UpdateBank.js';
import { skillingPetDropRate } from '@/lib/util.js';
import { calcAnglerBoostPercent, calcMinnowQuantityRange, calcRadasBlessingBoost } from './fishingUtil.js';

export function calcFishingTripResult({
	fish,
	quantity,
	duration,
	flakesQuantity,
	gearBank,
	rng
}: {
	fish: Fish;
	quantity: number;
	duration: number;
	flakesQuantity?: number;
	gearBank: GearBank;
	rng: RNGProvider;
}) {
	const updateBank = new UpdateBank();
	const boosts: string[] = [];

	const { blessingEquipped, blessingChance } = calcRadasBlessingBoost(gearBank);

	if (blessingEquipped) {
		boosts.push(`Rada's Blessing: ${blessingChance}% chance of extra fish`);
	}

	let xpReceived = 0;
	let leapingSturgeon = 0;
	let leapingSalmon = 0;
	let leapingTrout = 0;
	let agilityXpReceived = 0;
	let strengthXpReceived = 0;

	const stats = gearBank.skillsAsLevels;
	const canGetSturgeon = stats.fishing >= 70 && stats.agility >= 45 && stats.strength >= 45;
	const canGetSalmon = stats.fishing >= 58 && stats.agility >= 30 && stats.strength >= 30;
	const sturgeonChance = 255 / (8 + Math.floor(0.5714 * stats.fishing));
	const salmonChance = 255 / (16 + Math.floor(0.8616 * stats.fishing));
	const leapingChance = 255 / (32 + Math.floor(1.632 * stats.fishing));

	if (fish.name === 'Barbarian fishing') {
		for (let i = 0; i < quantity; i++) {
			if (canGetSturgeon && rng.roll(sturgeonChance)) {
				xpReceived += 80;
				leapingSturgeon += blessingEquipped && rng.percentChance(blessingChance) ? 2 : 1;
				agilityXpReceived += 7;
				strengthXpReceived += 7;
			} else if (canGetSalmon && rng.roll(salmonChance)) {
				xpReceived += 70;
				leapingSalmon += blessingEquipped && rng.percentChance(blessingChance) ? 2 : 1;
				agilityXpReceived += 6;
				strengthXpReceived += 6;
			} else if (rng.roll(leapingChance)) {
				xpReceived += 50;
				leapingTrout += blessingEquipped && rng.percentChance(blessingChance) ? 2 : 1;
				agilityXpReceived += 5;
				strengthXpReceived += 5;
			}
		}
	} else {
		xpReceived = quantity * fish.xp;
	}

	const anglerBoost = calcAnglerBoostPercent(gearBank);
	if (anglerBoost > 0) {
		const anglerXP = Math.ceil(calcPercentOfNum(anglerBoost, xpReceived));
		boosts.push(`${anglerBoost.toFixed(2)}% (${anglerXP.toLocaleString()} XP) from Angler outfit`);
		xpReceived += anglerXP;
	}

	updateBank.xpBank.add('fishing', xpReceived, { duration });
	if (agilityXpReceived > 0) {
		updateBank.xpBank.add('agility', agilityXpReceived, { duration });
	}
	if (strengthXpReceived > 0) {
		updateBank.xpBank.add('strength', strengthXpReceived, { duration });
	}

	let lootQuantity = 0;
	const baseKarambwanji = 1 + Math.floor(gearBank.skillsAsLevels.fishing / 5);

	const fishPerQuantity = match(fish.id)
		.with(EItem.RAW_KARAMBWANJI, () => () => baseKarambwanji)
		.with(EItem.MINNOW, () => () => rng.randInt(...calcMinnowQuantityRange(gearBank)))
		.otherwise(() => () => 1);

	let qtyFromBlessing = 0;
	let qtyFromFlakes = 0;
	for (let i = 0; i < quantity; i++) {
		lootQuantity += fishPerQuantity();

		if (blessingEquipped && rng.percentChance(blessingChance)) {
			qtyFromBlessing += fishPerQuantity();
		}

		if (flakesQuantity && flakesQuantity > 0 && rng.percentChance(50)) {
			qtyFromFlakes += 1;
			flakesQuantity--;
		}
	}

	updateBank.itemLootBank.add(fish.id, lootQuantity);
	if (qtyFromBlessing > 0) {
		boosts.push(`+${qtyFromBlessing} fish from Rada's Blessing`);
		updateBank.itemLootBank.add(fish.id, qtyFromBlessing);
	}

	if (qtyFromFlakes > 0) {
		boosts.push(`+${qtyFromFlakes} fish from Spirit flakes`);
		updateBank.itemLootBank.add(fish.id, qtyFromFlakes);
	}

	// Add clue scrolls
	if (fish.clueScrollChance) {
		addSkillingClueToLoot(gearBank, 'fishing', quantity, fish.clueScrollChance, updateBank.itemLootBank);
	}

	// Add barbarian fish to loot
	if (fish.name === 'Barbarian fishing') {
		updateBank.itemLootBank.remove(fish.id, updateBank.itemLootBank.amount(fish.id));
		updateBank.itemLootBank.add('Leaping sturgeon', leapingSturgeon);
		updateBank.itemLootBank.add('Leaping salmon', leapingSalmon);
		updateBank.itemLootBank.add('Leaping trout', leapingTrout);
	}

	// Roll for pet
	if (fish.petChance) {
		const { petDropRate } = skillingPetDropRate(gearBank, 'fishing', fish.petChance);
		for (let i = 0; i < quantity; i++) {
			if (rng.roll(petDropRate)) {
				updateBank.itemLootBank.add('Heron');
			}
		}
	}

	if (fish.bigFishRate && fish.bigFish) {
		for (let i = 0; i < quantity; i++) {
			if (rng.roll(fish.bigFishRate)) {
				updateBank.itemLootBank.add(fish.bigFish);
			}
		}
	}

	return {
		updateBank,
		boosts
	};
}
