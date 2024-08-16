import { time } from 'discord.js';
import { Bank } from 'oldschooljs';

import type { Birdhouse } from '../../../lib/skilling/skills/hunter/birdHouseTrapping';
import birdhouses, { birdhouseSeeds } from '../../../lib/skilling/skills/hunter/birdHouseTrapping';
import type { BirdhouseData } from '../../../lib/skilling/skills/hunter/defaultBirdHouseTrap';
import defaultBirdhouseTrap from '../../../lib/skilling/skills/hunter/defaultBirdHouseTrap';
import type { BirdhouseActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { mahojiUsersSettingsFetch, userHasGracefulEquipped } from '../../mahojiSettings';

interface BirdhouseDetails {
	raw: BirdhouseData;
	isReady: boolean;
	readyIn: null | number;
	birdHouse: Birdhouse | null;
	readyAt: Date | null;
}

export function calculateBirdhouseDetails(user: MUser): BirdhouseDetails {
	const birdHouseTraps = user.user.minion_birdhouseTraps;
	if (!birdHouseTraps) {
		return {
			raw: defaultBirdhouseTrap,
			isReady: false,
			readyIn: null,
			birdHouse: null,
			readyAt: null
		};
	}

	const details = birdHouseTraps as unknown as BirdhouseData;

	const birdHouse = details.lastPlaced ? birdhouses.find(_birdhouse => _birdhouse.name === details.lastPlaced) : null;
	if (!birdHouse) throw new Error(`Missing ${details.lastPlaced} birdhouse`);

	const lastPlacedTime: number = details.birdhouseTime;
	const difference = Date.now() - lastPlacedTime;
	const isReady = difference > birdHouse.waitTime;
	const readyIn = lastPlacedTime + birdHouse.waitTime - Date.now();
	return {
		raw: details,
		isReady,
		readyIn,
		birdHouse,
		readyAt: new Date(Date.now() + readyIn)
	};
}

export async function birdhouseCheckCommand(user: MUser) {
	const details = calculateBirdhouseDetails(user);
	if (!details.birdHouse) {
		return 'You have no birdhouses planted.';
	}
	if (details.isReady) return `Your ${details.birdHouse.name}'s are **ready**!`;
	return `Your ${details.birdHouse.name}'s are ready ${time(details.readyAt!, 'R')} (${time(details.readyAt!)})`;
}

export async function birdhouseHarvestCommand(user: MUser, channelID: string, inputBirdhouseName: string | undefined) {
	const userBank = user.bank;
	const currentDate = new Date().getTime();
	const infoStr: string[] = [];
	const boostStr: string[] = [];

	const existingBirdhouse = await calculateBirdhouseDetails(user);
	if (!existingBirdhouse.isReady && existingBirdhouse.raw.lastPlaced) return birdhouseCheckCommand(user);

	let birdhouseToPlant = inputBirdhouseName
		? birdhouses.find(_birdhouse =>
				_birdhouse.aliases.some(
					alias =>
						stringMatches(alias, inputBirdhouseName) ||
						stringMatches(alias.split(' ')[0], inputBirdhouseName)
				)
			)
		: undefined;
	if (!birdhouseToPlant && existingBirdhouse.birdHouse) birdhouseToPlant = existingBirdhouse.birdHouse;

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
	if (userHasGracefulEquipped(user)) {
		boostStr.push('10% time for Graceful');
		duration *= 0.9;
	}
	let gotCraft = false;
	const removeBank = new Bank();
	const premadeBankCost = birdhouseToPlant.houseItemReq.clone().multiply(4);
	if (user.owns(premadeBankCost)) {
		removeBank.add(premadeBankCost);
	} else {
		if (skills.crafting < birdhouseToPlant.craftLvl) {
			return `${user.minionName} needs ${birdhouseToPlant.craftLvl} Crafting to make ${birdhouseToPlant.name} during the run or write \`/activities birdhouse run --nocraft\`.`;
		}
		gotCraft = true;
		removeBank.add(birdhouseToPlant.craftItemReq.clone().multiply(4));
	}

	let canPay = false;

	const mUser = await mahojiUsersSettingsFetch(user.id, { favorite_bh_seeds: true });
	const favourites = mUser.favorite_bh_seeds;
	if (favourites.length > 0) {
		for (const fav of favourites) {
			const seed = birdhouseSeeds.find(s => s.item.id === fav);
			if (!seed) continue;
			const seedCost = new Bank().add(seed.item.id, seed.amount * 4);
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
			const seedCost = new Bank().add(currentSeed.item.id, currentSeed.amount * 4);
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

	await updateBankSetting('farming_cost_bank', removeBank);
	await transactItems({ userID: user.id, itemsToRemove: removeBank });

	// If user does not have something already placed, just place the new birdhouses.
	if (!existingBirdhouse.raw.birdhousePlaced) {
		infoStr.unshift(`${user.minionName} is now placing 4x ${birdhouseToPlant.name}.`);
	} else {
		infoStr.unshift(
			`${user.minionName} is now collecting 4x ${existingBirdhouse.raw.lastPlaced}, and then placing 4x ${birdhouseToPlant.name}.`
		);
	}

	await addSubTaskToActivityTask<BirdhouseActivityTaskOptions>({
		birdhouseName: birdhouseToPlant.name,
		birdhouseData: existingBirdhouse.raw,
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		placing: true,
		gotCraft,
		currentDate,
		type: 'Birdhouse'
	});

	return `${infoStr.join(' ')}\n\nIt'll take around ${formatDuration(duration)} to finish.\n\n${
		boostStr.length > 0 ? '**Boosts**: ' : ''
	}${boostStr.join(', ')}`;
}
