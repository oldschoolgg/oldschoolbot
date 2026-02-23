import { GearStat } from '@oldschoolgg/gear';
import { formatDuration, objectEntries, reduceNumByPercent, stringMatches } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';
import { pick } from 'remeda';

import TrekShopItems, { TrekExperience } from '@/lib/data/buyables/trekBuyables.js';
import { difficulties, rewardTokens, trekBankBoosts } from '@/lib/minions/data/templeTrekking.js';
import type { AddXpParams } from '@/lib/minions/types.js';
import type { GearRequirement } from '@/lib/structures/Gear.js';
import type { TempleTrekkingActivityTaskOptions } from '@/lib/types/minions.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';
import { readableStatName } from '@/lib/util/smallUtils.js';

export async function trekCommand(user: MUser, channelId: string, difficulty: string, quantity: number | undefined) {
	const tier = difficulties.find(item => stringMatches(item.difficulty, difficulty));
	if (!tier) return 'that is not a valid difficulty';
	const minLevel = tier.minCombat;
	const qp = user.QP;
	const allGear = user.gear;

	if (tier.minimumGearRequirements) {
		for (const [setup, requirements] of objectEntries(tier.minimumGearRequirements)) {
			const gear = allGear[setup];
			if (setup && requirements) {
				let newRequirements: GearRequirement = requirements;
				const meleeStats = pick(gear.getStats(), ['attack_crush', 'attack_slash', 'attack_stab']);
				const sorted = Array.from(objectEntries(meleeStats)).sort((a, b) => b[1] - a[1]);
				const maxMeleeStat = sorted[0];

				if (setup === 'melee') {
					if (maxMeleeStat[0] !== GearStat.AttackCrush) newRequirements.attack_crush = undefined;
					if (maxMeleeStat[0] !== GearStat.AttackSlash) newRequirements.attack_slash = undefined;
					if (maxMeleeStat[0] !== GearStat.AttackStab) newRequirements.attack_stab = undefined;
				} else {
					newRequirements = requirements;
				}

				const [meetsRequirements, unmetKey, has] = gear.meetsStatRequirements(newRequirements);
				if (!meetsRequirements) {
					return `You don't have the requirements to do ${tier.difficulty} treks! Your ${readableStatName(
						unmetKey!
					)} stat in your ${setup} setup is ${has}, but you need at least ${
						tier.minimumGearRequirements[setup]?.[unmetKey!]
					}.`;
				}
			}
		}
	}

	if (qp < 30) {
		return 'You need at least level 30 QP to do Temple Trekking.';
	}

	if (minLevel !== undefined && user.combatLevel < minLevel) {
		return `You need to be at least combat level ${minLevel} for ${difficulty} Temple Trekking.`;
	}

	let tripTime = tier.time;
	const boosts = [];

	// Every 25 trips becomes 1% faster to a cap of 10%
	const percentFaster = Math.min(Math.floor((await user.fetchMinigameScore('temple_trekking')) / 25), 10);

	boosts.push(`${percentFaster.toFixed(1)}% from completed treks`);

	tripTime = reduceNumByPercent(tripTime, percentFaster);

	for (const [item, percent] of trekBankBoosts.items()) {
		if (user.hasEquippedOrInBank(item.id)) {
			boosts.push(`${percent}% for ${item.name}`);
			tripTime = reduceNumByPercent(tripTime, percent);
		}
	}

	if (!user.hasGracefulEquipped()) {
		boosts.push('-15% for not having graceful equipped anywhere');
		tripTime *= 1.15;
	}

	const hasMoryHard = user.hasDiary('morytania.hard');

	if (hasMoryHard) {
		boosts.push('15% for Morytania hard diary');
		tripTime *= 0.85;
	}

	if (user.hasEquippedOrInBank(['Ivandis flail'])) {
		let flailBoost = tier.boosts.ivandis;
		let itemName = 'Ivandis';
		if (user.hasEquippedOrInBank(['Blisterwood flail'])) {
			flailBoost -= 1 - tier.boosts.blisterwood;
			itemName = 'Blisterwood';
		}

		itemName += ' flail';
		boosts.push(`${((1 - flailBoost) * 100).toFixed(1)}% ${itemName}`);
		tripTime *= flailBoost;
	}

	const maxTripLength = await user.calcMaxTripLength('Trekking');
	const maxTrips = Math.floor(maxTripLength / tripTime);
	if (quantity === undefined || quantity === null) {
		quantity = maxTrips;
	} else {
		quantity = quantity > maxTrips ? maxTrips : quantity;
	}

	const duration = quantity * tripTime;

	await ActivityManager.startTrip<TempleTrekkingActivityTaskOptions>({
		difficulty,
		quantity,
		userID: user.id,
		duration,
		type: 'Trekking',
		channelId,
		minigameID: 'temple_trekking'
	});

	let str = `${user.minionName} is now doing Temple Trekking ${quantity} times. The trip will take ${formatDuration(
		duration
	)}, with each trek taking ${await formatTripDuration(user, tripTime)}.`;

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return `${str}`;
}

export async function trekShop(
	rng: RNGProvider,
	user: MUser,
	reward: string,
	difficulty: string,
	quantity: number | undefined,
	interaction: MInteraction
) {
	const userBank = user.bank;
	const specifiedItem = TrekShopItems.find(
		item => stringMatches(reward, item.name) || item.aliases?.some(alias => stringMatches(alias, reward))
	);

	if (!specifiedItem) {
		return `Item not recognized. Possible items: ${TrekShopItems.map(item => {
			return item.name;
		}).join(', ')}.`;
	}

	const inbankquantity =
		difficulty === 'Easy'
			? userBank.amount(rewardTokens.easy)
			: difficulty === 'Medium'
				? userBank.amount(rewardTokens.medium)
				: userBank.amount(rewardTokens.hard);
	if (quantity === undefined) {
		quantity = inbankquantity;
	}
	if (quantity > inbankquantity || quantity === 0) {
		return "You don't have enough reward tokens for that.";
	}
	const outItems = new Bank();

	const inItems = new Bank();
	const outXP: AddXpParams[] = [
		{
			skillName: 'agility',
			amount: 0,
			minimal: true,
			source: 'TempleTrekking'
		},
		{
			skillName: 'thieving',
			amount: 0,
			minimal: true,
			source: 'TempleTrekking'
		},
		{
			skillName: 'slayer',
			amount: 0,
			minimal: true,
			source: 'TempleTrekking'
		},
		{
			skillName: 'firemaking',
			amount: 0,
			minimal: true,
			source: 'TempleTrekking'
		},
		{
			skillName: 'fishing',
			amount: 0,
			minimal: true,
			source: 'TempleTrekking'
		},
		{
			skillName: 'woodcutting',
			amount: 0,
			minimal: true,
			source: 'TempleTrekking'
		},
		{
			skillName: 'mining',
			amount: 0,
			minimal: true,
			source: 'TempleTrekking'
		}
	];
	for (let i = 0; i < quantity; i++) {
		let outputTotal = 0;
		switch (difficulty) {
			case 'Easy':
				inItems.addItem(rewardTokens.easy, 1);
				outputTotal = rng.randInt(specifiedItem.easyRange[0], specifiedItem.easyRange[1]);
				break;
			case 'Medium':
				inItems.addItem(rewardTokens.medium, 1);
				outputTotal = rng.randInt(specifiedItem.medRange[0], specifiedItem.medRange[1]);
				break;
			case 'Hard':
				inItems.addItem(rewardTokens.hard, 1);
				outputTotal = rng.randInt(specifiedItem.hardRange[0], specifiedItem.hardRange[1]);
				break;
		}
		if (specifiedItem.name === 'Herbs') {
			outItems.add(
				rng.percentChance(50) ? 'Tarromin' : 'Harralander',
				Math.floor(reduceNumByPercent(outputTotal, 34))
			);
			outItems.add('Toadflax', Math.floor(reduceNumByPercent(outputTotal, 66)));
		} else if (specifiedItem.name === 'Ore') {
			outItems.add('Coal', Math.floor(reduceNumByPercent(outputTotal, 34)));
			outItems.add('Iron ore', Math.floor(reduceNumByPercent(outputTotal, 66)));
		} else if (specifiedItem.name === 'Experience') {
			const randXP = Math.floor(Math.random() * TrekExperience.length) + 1;

			(outXP.find(item => item.skillName === TrekExperience[randXP]) || outXP[0]).amount += outputTotal;
		} else {
			outItems.add(specifiedItem.name, outputTotal);
		}
	}
	if (!userBank.has(inItems)) {
		return "You don't have enough reward tokens for that.";
	}

	await interaction.confirmation(
		`${user}, please confirm that you want to use ${quantity} ${difficulty} reward tokens to buy sets of ${specifiedItem.name}.`
	);

	if (outItems.length > 0) await user.addItemsToBank({ items: outItems, collectionLog: false });
	await user.removeItemsFromBank(inItems);

	let ret = `You redeemed **${inItems}** for `;
	if (outItems.length > 0) {
		ret += `**${outItems}**`;
	} else {
		ret += 'XP. You received: ';
	}

	ret += (await Promise.all(outXP.filter(xp => xp.amount > 0).map(xp => user.addXP(xp)))).join(', ');

	return `${ret}.`;
}
