import { User } from '@prisma/client';
import { objectEntries, reduceNumByPercent } from 'e';
import { KlasaUser } from 'klasa';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import TrekShopItems, { TrekExperience } from '../../../lib/data/buyables/trekBuyables';
import { MorytaniaDiary, userhasDiaryTier } from '../../../lib/diaries';
import { GearStat, readableStatName } from '../../../lib/gear';
import { difficulties, rewardTokens, trekBankBoosts } from '../../../lib/minions/data/templeTrekking';
import { AddXpParams, GearRequirement } from '../../../lib/minions/types';
import { getMinigameScore } from '../../../lib/settings/minigames';
import { SkillsEnum } from '../../../lib/skilling/types';
import { TempleTrekkingActivityTaskOptions } from '../../../lib/types/minions';
import { combatLevel, formatDuration, itemNameFromID, percentChance, rand, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { hasItemsEquippedOrInBank, minionName } from '../../../lib/util/minionUtils';
import { getUserGear, handleMahojiConfirmation, userHasGracefulEquipped } from '../../mahojiSettings';

export async function trekCommand(user: User, channelID: BigInt, difficulty: string, quantity: number | undefined) {
	const tier = difficulties.find(item => stringMatches(item.difficulty, difficulty));
	if (!tier) return 'that is not a valid difficulty';
	const minLevel = tier.minCombat;
	const qp = user.QP;
	const allGear = getUserGear(user);

	if (tier.minimumGearRequirements) {
		for (const [setup, requirements] of objectEntries(tier.minimumGearRequirements)) {
			const gear = allGear[setup];
			if (setup && requirements) {
				let newRequirements: GearRequirement = requirements;
				let maxMeleeStat:
					| GearStat
					| [
							(
								| 'attack_stab'
								| 'attack_slash'
								| 'attack_crush'
								| 'attack_magic'
								| 'attack_ranged'
								| 'defence_stab'
								| 'defence_slash'
								| 'defence_crush'
								| 'defence_magic'
								| 'defence_ranged'
								| 'melee_strength'
								| 'ranged_strength'
								| 'magic_damage'
								| 'prayer'
							),
							number
					  ] = [GearStat.AttackCrush, -500];
				objectEntries(gear.getStats()).map(
					stat =>
						(maxMeleeStat =
							!stat[0].startsWith('defence') &&
							stat[0] !== 'attack_magic' &&
							stat[0] !== 'attack_ranged' &&
							stat[1] > maxMeleeStat[1]
								? stat
								: maxMeleeStat)
				);

				if (setup === 'melee') {
					if (maxMeleeStat[0] !== GearStat.AttackCrush) delete newRequirements.attack_crush;
					if (maxMeleeStat[0] !== GearStat.AttackSlash) delete newRequirements.attack_slash;
					if (maxMeleeStat[0] !== GearStat.AttackStab) delete newRequirements.attack_stab;
				} else {
					newRequirements = requirements;
				}

				const [meetsRequirements, unmetKey, has] = gear.meetsStatRequirements(newRequirements);
				if (!meetsRequirements) {
					return `You don't have the requirements to do ${tier.difficulty} treks! Your ${readableStatName(
						unmetKey!
					)} stat in your ${setup} setup is ${has}, but you need atleast ${
						tier.minimumGearRequirements[setup]![unmetKey!]
					}.`;
				}
			}
		}
	}

	if (qp < 30) {
		return 'You need atleast level 30 QP to do Temple Trekking.';
	}

	if (minLevel !== undefined && combatLevel(user) < minLevel) {
		return `You need to be at least combat level ${minLevel} for ${difficulty} Temple Trekking.`;
	}

	let tripTime = tier.time;
	const boosts = [];

	// Every 25 trips becomes 1% faster to a cap of 10%
	const percentFaster = Math.min(Math.floor((await getMinigameScore(user.id, 'temple_trekking')) / 25), 10);

	boosts.push(`${percentFaster.toFixed(1)}% from completed treks`);

	tripTime = reduceNumByPercent(tripTime, percentFaster);

	for (const [id, percent] of objectEntries(trekBankBoosts)) {
		if (hasItemsEquippedOrInBank(user, [Number(id)])) {
			boosts.push(`${percent}% for ${itemNameFromID(Number(id))}`);
			tripTime = reduceNumByPercent(tripTime, percent);
		}
	}

	if (!userHasGracefulEquipped(user)) {
		boosts.push('-15% for not having graceful equipped anywhere');
		tripTime *= 1.15;
	}

	const [hasMoryHard] = await userhasDiaryTier(user, MorytaniaDiary.hard);

	if (hasMoryHard) {
		boosts.push('15% for Morytania hard diary');
		tripTime *= 0.85;
	}

	if (hasItemsEquippedOrInBank(user, ['Ivandis flail'])) {
		let flailBoost = tier.boosts.ivandis;
		let itemName = 'Ivandis';
		if (hasItemsEquippedOrInBank(user, ['Blisterwood flail'])) {
			flailBoost -= 1 - tier.boosts.blisterwood;
			itemName = 'Blisterwood';
		}

		itemName += ' flail';
		boosts.push(`${((1 - flailBoost) * 100).toFixed(1)}% ${itemName}`);
		tripTime *= flailBoost;
	}

	const maxTripLength = calcMaxTripLength(user, 'Trekking');
	const maxTrips = Math.floor(maxTripLength / tripTime);
	if (quantity === undefined || quantity === null) {
		quantity = maxTrips;
	} else {
		quantity = quantity > maxTrips ? maxTrips : quantity;
	}

	const duration = quantity * tripTime;

	await addSubTaskToActivityTask<TempleTrekkingActivityTaskOptions>({
		difficulty,
		quantity,
		userID: user.id,
		duration,
		type: 'Trekking',
		channelID: channelID.toString(),
		minigameID: 'temple_trekking'
	});

	let str = `${minionName(user)} is now doing Temple Trekking ${quantity} times. The trip will take ${formatDuration(
		duration
	)}, with each trek taking ${formatDuration(tripTime)}.`;

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return `${str}`;
}

export async function trekShop(
	user: KlasaUser,
	reward: string,
	difficulty: string,
	quantity: number | undefined,
	interaction: SlashCommandInteraction
) {
	await user.settings.sync(true);
	const userBank = user.bank();
	const specifiedItem = TrekShopItems.find(
		item =>
			stringMatches(reward, item.name) ||
			(item.aliases && item.aliases.some(alias => stringMatches(alias, reward)))
	);

	if (!specifiedItem) {
		return `Item not recognized. Possible items: ${TrekShopItems.map(item => {
			return item.name;
		}).join(', ')}.`;
	}

	let inbankquantity =
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
	let outItems = new Bank();

	let inItems = new Bank();
	let outXP: AddXpParams[] = [
		{
			skillName: SkillsEnum.Agility,
			amount: 0,
			minimal: true
		},
		{
			skillName: SkillsEnum.Thieving,
			amount: 0,
			minimal: true
		},
		{
			skillName: SkillsEnum.Slayer,
			amount: 0,
			minimal: true
		},
		{
			skillName: SkillsEnum.Firemaking,
			amount: 0,
			minimal: true
		},
		{
			skillName: SkillsEnum.Fishing,
			amount: 0,
			minimal: true
		},
		{
			skillName: SkillsEnum.Woodcutting,
			amount: 0,
			minimal: true
		},
		{
			skillName: SkillsEnum.Mining,
			amount: 0,
			minimal: true
		}
	];
	for (let i = 0; i < quantity; i++) {
		let outputTotal = 0;
		switch (difficulty) {
			case 'Easy':
				inItems.addItem(rewardTokens.easy, 1);
				outputTotal = rand(specifiedItem.easyRange[0], specifiedItem.easyRange[1]);
				break;
			case 'Medium':
				inItems.addItem(rewardTokens.medium, 1);
				outputTotal = rand(specifiedItem.medRange[0], specifiedItem.medRange[1]);
				break;
			case 'Hard':
				inItems.addItem(rewardTokens.hard, 1);
				outputTotal = rand(specifiedItem.hardRange[0], specifiedItem.hardRange[1]);
				break;
		}
		if (specifiedItem.name === 'Herbs') {
			outItems.add(
				percentChance(50) ? 'Tarromin' : 'Harralander',
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
	if (!userBank.has(inItems.bank)) {
		return "You don't have enough reward tokens for that.";
	}

	await handleMahojiConfirmation(
		interaction,
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
