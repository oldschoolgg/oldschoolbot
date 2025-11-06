import { time } from '@oldschoolgg/discord';
import { formatDuration, stringMatches } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import birdhouses, { birdhouseSeeds } from '@/lib/skilling/skills/hunter/birdHouseTrapping.js';
import type { BirdhouseActivityTaskOptions } from '@/lib/types/minions.js';

export function calcBirdhouseLimit() {
	const base = 4;
	return base;
}

export async function birdhouseCheckCommand(user: MUser) {
	const details = user.fetchBirdhouseData();
	if (!details.birdhouse) {
		return 'You have no birdhouses planted.';
	}
	if (details.isReady) return `Your ${details.birdhouse.name}'s are **ready**!`;
	return `Your ${details.birdhouse.name}'s are ready ${time(details.readyAt!, 'R')} (${time(details.readyAt!)})`;
}

export async function birdhouseHarvestCommand(user: MUser, channelId: string, inputBirdhouseName: string | undefined) {
	const userBank = user.bank;
	const infoStr: string[] = [];
	const boostStr: string[] = [];

	const existingBirdhouse = user.fetchBirdhouseData();
	if (!existingBirdhouse.isReady && existingBirdhouse.lastPlaced) return birdhouseCheckCommand(user);

	let birdhouseToPlant = inputBirdhouseName
		? birdhouses.find(_birdhouse =>
				_birdhouse.aliases.some(
					alias =>
						stringMatches(alias, inputBirdhouseName) ||
						stringMatches(alias.split(' ')[0], inputBirdhouseName)
				)
			)
		: undefined;
	if (!birdhouseToPlant && existingBirdhouse.birdhouse) birdhouseToPlant = existingBirdhouse.birdhouse;

	if (!birdhouseToPlant) {
		return `That's not a valid birdhouse. Valid bird houses are ${birdhouses
			.map(_birdhouse => _birdhouse.name)
			.join(', ')}.`;
	}

	const skills = user.skillsAsLevels;
	if (skills.hunter < birdhouseToPlant.huntLvl) {
		return `${user.minionName} needs ${birdhouseToPlant.huntLvl} Hunter to place ${birdhouseToPlant.name}.`;
	}

	if (user.QP < birdhouseToPlant.qpRequired) {
		return `${user.minionName} needs ${birdhouseToPlant.qpRequired} QP to do Birdhouse runs.`;
	}

	let duration: number = birdhouseToPlant.runTime;

	// Reduce time if user has graceful equipped
	if (user.hasGracefulEquipped()) {
		boostStr.push('10% time for Graceful');
		duration *= 0.9;
	}
	let gotCraft = false;
	const removeBank = new Bank();
	const birdhouseLimit = calcBirdhouseLimit();
	const premadeBankCost = new Bank().add(birdhouseToPlant.birdhouseItem, birdhouseLimit);
	if (user.owns(premadeBankCost)) {
		removeBank.add(premadeBankCost);
	} else {
		if (skills.crafting < birdhouseToPlant.craftLvl) {
			return `${user.minionName} needs ${birdhouseToPlant.craftLvl} Crafting to make ${birdhouseToPlant.name} during the run or write \`/activities birdhouse run --nocraft\`.`;
		}
		gotCraft = true;
		removeBank.add(birdhouseToPlant.craftItemReq.clone().multiply(birdhouseLimit));
	}

	let canPay = false;

	const favourites = user.user.favorite_bh_seeds;
	if (favourites.length > 0) {
		for (const fav of favourites) {
			const seed = birdhouseSeeds.find(s => s.item.id === fav);
			if (!seed) continue;
			const seedCost = new Bank().add(seed.item.id, seed.amount * birdhouseLimit);
			if (userBank.has(seedCost)) {
				infoStr.push(`You baited the birdhouses with ${seedCost}.`);
				removeBank.add(seedCost);
				canPay = true;
				break;
			}
		}
		if (!canPay) return "You don't have enough favourited seeds to bait the birdhouses.";
	} else {
		for (const currentSeed of birdhouseSeeds) {
			const seedCost = new Bank().add(currentSeed.item.id, currentSeed.amount * birdhouseLimit);
			if (userBank.has(seedCost)) {
				infoStr.push(`You baited the birdhouses with ${seedCost}.`);
				removeBank.add(seedCost);
				canPay = true;
				break;
			}
		}
	}

	if (!canPay) {
		return "You don't have enough seeds to bait the birdhouses.";
	}
	if (!user.owns(removeBank)) return `You don't own: ${removeBank}.`;

	await ClientSettings.updateBankSetting('farming_cost_bank', removeBank);
	await user.transactItems({ itemsToRemove: removeBank });

	// If user does not have something already placed, just place the new birdhouses.
	if (!existingBirdhouse.birdhousePlaced) {
		infoStr.unshift(`${user.minionName} is now placing ${birdhouseLimit}x ${birdhouseToPlant.name}.`);
	} else {
		infoStr.unshift(
			`${user.minionName} is now collecting ${birdhouseLimit}x ${existingBirdhouse.lastPlaced}, and then placing ${birdhouseLimit}x ${birdhouseToPlant.name}.`
		);
	}

	await ActivityManager.startTrip<BirdhouseActivityTaskOptions>({
		userID: user.id,
		channelId,
		duration,
		placing: true,
		gotCraft,
		type: 'Birdhouse'
	});

	return `${infoStr.join(' ')}\n\nIt'll take around ${formatDuration(duration)} to finish.\n\n${
		boostStr.length > 0 ? '**Boosts**: ' : ''
	}${boostStr.join(', ')}`;
}
