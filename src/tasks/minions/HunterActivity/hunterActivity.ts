import type { Prisma } from '@prisma/client';
import { Time, randInt } from 'e';
import { Bank } from 'oldschooljs';
import { EquipmentSlot, type ItemBank } from 'oldschooljs/dist/meta/types';

import { increaseBankQuantitesByPercent } from '@oldschoolgg/toolkit';
import { PortentID, chargePortentIfHasCharges } from '../../../lib/bso/divination';
import { GLOBAL_BSO_XP_MULTIPLIER, MAX_LEVEL, PeakTier } from '../../../lib/constants';
import { globalDroprates } from '../../../lib/data/globalDroprates';
import type { UserFullGearSetup } from '../../../lib/gear';
import { hasWildyHuntGearEquipped } from '../../../lib/gear/functions/hasWildyHuntGearEquipped';
import { InventionID, inventionBoosts, inventionItemBoost } from '../../../lib/invention/inventions';

import { calcLootXPHunting, generateHerbiTable } from '../../../lib/skilling/functions/calcsHunter';
import Hunter from '../../../lib/skilling/skills/hunter/hunter';
import { type Creature, SkillsEnum } from '../../../lib/skilling/types';
import type { Gear } from '../../../lib/structures/Gear';
import type { Skills } from '../../../lib/types';
import type { HunterActivityTaskOptions } from '../../../lib/types/minions';
import { clAdjustedDroprate, roll, skillingPetDropRate, stringMatches, toKMB } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';
import { userHasGracefulEquipped } from '../../../mahoji/mahojiSettings';
import { BLACK_CHIN_ID, HERBIBOAR_ID } from './../../../lib/constants';

const riskDeathNumbers = [
	{
		peakTier: PeakTier.High,
		extraChance: -80
	},
	{
		peakTier: PeakTier.Medium,
		extraChance: -20
	},
	{
		peakTier: PeakTier.Low,
		extraChance: 80
	}
];

export function calculateHunterResult({
	creature,
	allItemsOwned,
	skillsAsLevels,
	usingHuntPotion,
	usingStaminaPotion,
	bank,
	quantity,
	duration,
	creatureScores,
	allGear,
	collectionLog,
	equippedPet,
	skillsAsXP,
	hasHunterMasterCape,
	wildyPeakTier,
	isUsingArcaneHarvester,
	arcaneHarvesterMessages,
	portentResult,
	invincible = false,
	noRandomness = false,
	graceful,
	experienceScore
}: {
	creature: Creature;
	bank: Bank;
	allItemsOwned: Bank;
	skillsAsLevels: Required<Skills>;
	skillsAsXP: Required<Skills>;
	usingHuntPotion: boolean;
	usingStaminaPotion: boolean;
	quantity: number;
	duration: number;
	creatureScores: ItemBank;
	allGear: UserFullGearSetup;
	collectionLog: Bank;
	equippedPet: number | null;
	hasHunterMasterCape: boolean;
	wildyPeakTier?: PeakTier;
	isUsingArcaneHarvester: boolean;
	arcaneHarvesterMessages?: string;
	portentResult: Awaited<ReturnType<typeof chargePortentIfHasCharges>>;
	invincible?: boolean;
	noRandomness?: boolean;
	graceful: boolean;
	experienceScore: number;
}) {
	const messages: string[] = [];
	let gotPked = false;
	let died = false;
	let pkedQuantity = 0;
	const totalCost = new Bank();
	let newWildyGear: Gear | null = null;

	let [successfulQuantity, totalHunterXP] = calcLootXPHunting(
		Math.min(Math.floor(skillsAsLevels.hunter + (usingHuntPotion ? 2 : 0)), MAX_LEVEL),
		creature,
		quantity,
		usingStaminaPotion,
		graceful,
		experienceScore,
		noRandomness
	);

	const crystalImpling = creature.name === 'Crystal impling';

	if (creature.wildy) {
		let riskPkChance = creature.id === BLACK_CHIN_ID ? 100 : 200;
		riskPkChance += riskDeathNumbers.find(_peaktier => _peaktier.peakTier === wildyPeakTier)?.extraChance ?? 0;
		let riskDeathChance = 20;
		// The more experienced the less chance of death.
		riskDeathChance += Math.min(Math.floor((creatureScores[creature.id] ?? 1) / 100), 200);

		// Gives lower death chance depending on what the user got equipped in wildy.
		const [, , score] = hasWildyHuntGearEquipped(allGear.wildy);
		riskDeathChance += score;
		if (invincible) {
			riskDeathChance = 1_000_000_000;
		}
		for (let i = 0; i < duration / Time.Minute; i++) {
			if (roll(riskPkChance) && !invincible) {
				gotPked = true;
				break;
			}
		}
		if (gotPked && roll(riskDeathChance) && !invincible) {
			died = true;
			const cost = new Bank().add('Saradomin brew(4)', 10).add('Super restore(4)', 5);
			totalCost.add(cost);
			const newGear = allGear.wildy.clone();
			newGear[EquipmentSlot.Body] = null;
			newGear[EquipmentSlot.Legs] = null;

			newWildyGear = newGear;

			pkedQuantity = 0.5 * successfulQuantity;
			totalHunterXP *= 0.8;
			messages.push(
				'Your minion got killed during the activity and lost gear, catch quantity, 10x Saradomin brew and 5x Super restore.'
			);
		}
		if (gotPked && !died && !invincible) {
			if (bank.amount('Saradomin brew(4)') >= 10 && bank.amount('Super restore(4)') >= 5) {
				const lostBrew = randInt(1, 10);
				const lostRestore = randInt(1, 5);
				const cost = new Bank().add('Saradomin brew(4)', lostBrew).add('Super restore(4)', lostRestore);
				totalCost.add(cost);

				messages.push(
					`Your minion got attacked during the activity, escaped and lost some catch quantity, and ${cost}.`
				);
				pkedQuantity = 0.1 * successfulQuantity;
				totalHunterXP *= 0.9;
			}
		}
	}

	let babyChinChance = 0;
	if (creature.name.toLowerCase().includes('chinchompa')) {
		babyChinChance =
			creature.name === 'Chinchompa' ? 131_395 : creature.name === 'Carnivorous chinchompa' ? 98_373 : 82_758;
	}
	const { petDropRate } = skillingPetDropRate(skillsAsXP.hunter, SkillsEnum.Hunter, babyChinChance);

	let creatureTable = creature.table;
	let totalHerbloreXP = 0;

	let increasedOutputPercent = 0;
	if (creature.id === HERBIBOAR_ID) {
		if (isUsingArcaneHarvester) {
			messages.push(
				`${inventionBoosts.arcaneHarvester.herbiboarExtraYieldPercent}% bonus yield from Arcane Harvester (${arcaneHarvesterMessages})`
			);
			increasedOutputPercent += inventionBoosts.arcaneHarvester.herbiboarExtraYieldPercent;
		}
		if (allItemsOwned.has('Herblore master cape')) {
			const bonus = 20;
			messages.push(`${bonus}% bonus yield from Herblore master cape`);
			increasedOutputPercent += bonus;
		}
		creatureTable = generateHerbiTable(skillsAsLevels.herblore, allItemsOwned.has('Magic secateurs'));
		if (allItemsOwned.has('Magic secateurs')) {
			messages.push('Extra herbs for Magic secateurs');
		}
		// TODO: Check wiki in future for herblore xp from herbiboar
		if (skillsAsLevels.herblore >= 31) {
			totalHerbloreXP += quantity * (noRandomness ? 50 : randInt(25, 75));
		}
	}
	const canGetPet = creature.name.toLowerCase().includes('chinchompa');

	if (crystalImpling) {
		// Limit it to a max of 22 crystal implings per hour
		successfulQuantity = Math.min(successfulQuantity, Math.round((21 / 60) * duration) + 1);
	}

	const loot = new Bank();
	const realQuantity = successfulQuantity - pkedQuantity;

	if (!portentResult.didCharge) {
		for (let i = 0; i < realQuantity; i++) {
			loot.add(creatureTable.roll());
			if (roll(petDropRate) && canGetPet) {
				loot.add(itemID('Baby chinchompa'));
			}
		}
	} else {
		let bonusXP = realQuantity * (creature.hunterXP * (creature.hunterXP / 733));
		if (died) {
			bonusXP /= 2;
		}
		totalHunterXP += bonusXP;
		messages.push(
			`${toKMB(bonusXP * GLOBAL_BSO_XP_MULTIPLIER)} bonus XP from your Pacifist Portent (${
				portentResult.portent.charges_remaining
			} charges remaining)`
		);
	}

	if (increasedOutputPercent) {
		increaseBankQuantitesByPercent(loot, increasedOutputPercent);
	}

	if (creature.name === 'Eastern ferret') {
		const zippyDroprate = clAdjustedDroprate(
			collectionLog,
			'Zippy',
			globalDroprates.zippyHunter.baseRate,
			globalDroprates.zippyHunter.clIncrease
		);
		for (let i = 0; i < quantity; i++) {
			if (roll(zippyDroprate)) {
				loot.add('Zippy');
			}
		}
	}
	if (creature.name === 'Sand Gecko') {
		const sandyDroprate = clAdjustedDroprate(
			collectionLog,
			'Sandy',
			globalDroprates.sandy.baseRate,
			globalDroprates.sandy.clIncrease
		);
		for (let i = 0; i < quantity; i++) {
			if (roll(sandyDroprate)) {
				loot.add('Sandy');
			}
		}
	}

	if (equippedPet === itemID('Sandy') && creature.name !== 'Eastern ferret') {
		if (creature.id === 3251) {
			if (hasHunterMasterCape) {
				messages.push('You received **double** loot because of Sandy, and being a master hunter.');
				loot.multiply(2);
			}
		} else {
			messages.push('You received **triple** loot because of Sandy.');
			loot.multiply(3);
		}
	}

	return {
		successfulQuantity,
		loot,
		newWildyGear,
		died,
		gotPked,
		messages,
		totalHerbloreXP,
		totalHunterXP,
		totalCost
	};
}

export const hunterTask: MinionTask = {
	type: 'Hunter',
	async run(data: HunterActivityTaskOptions) {
		const { creatureName, quantity, userID, channelID, usingHuntPotion, wildyPeak, duration, usingStaminaPotion } =
			data;
		const user = await mUserFetch(userID);
		const creature = Hunter.Creatures.find(creature =>
			creature.aliases.some(
				alias => stringMatches(alias, creatureName) || stringMatches(alias.split(' ')[0], creatureName)
			)
		);

		if (!creature) return;

		const crystalImpling = creature.name === 'Crystal impling';

		let graceful = false;
		if (userHasGracefulEquipped(user)) {
			graceful = true;
		}

		const experienceScore = await user.getCreatureScore(creature.id);

		const boostRes =
			creature.id === HERBIBOAR_ID && user.allItemsOwned.has('Arcane harvester')
				? await inventionItemBoost({
						user,
						inventionID: InventionID.ArcaneHarvester,
						duration: quantity * Time.Minute * 4
					})
				: null;

		const minutes = Math.ceil(duration / Time.Minute);
		const portentResult = await chargePortentIfHasCharges({
			user,
			portentID: PortentID.PacifistPortent,
			charges: minutes
		});

		const { successfulQuantity, loot, newWildyGear, messages, totalHerbloreXP, totalHunterXP, totalCost } =
			calculateHunterResult({
				creature,
				allItemsOwned: user.allItemsOwned,
				skillsAsLevels: user.skillsAsLevels,
				skillsAsXP: user.skillsAsXP,
				usingHuntPotion,
				usingStaminaPotion,
				bank: user.bank,
				quantity,
				duration,
				creatureScores: (await user.fetchStats({ creature_scores: true })).creature_scores as ItemBank,
				allGear: user.gear,
				collectionLog: user.cl,
				hasHunterMasterCape: user.hasEquippedOrInBank('Hunter master cape'),
				equippedPet: user.user.minion_equippedPet,
				wildyPeakTier: wildyPeak?.peakTier,
				isUsingArcaneHarvester: boostRes?.success ?? false,
				arcaneHarvesterMessages: boostRes?.success ? boostRes.messages : undefined,
				portentResult,
				graceful,
				experienceScore
			});

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot,
			itemsToRemove: totalCost
		});

		await user.incrementCreatureScore(creature.id, Math.floor(successfulQuantity));

		let xpStr = '';
		xpStr += await user.addXP({
			skillName: SkillsEnum.Hunter,
			amount: totalHunterXP,
			duration
		});

		if (totalHerbloreXP > 0) {
			xpStr = await user.addXP({
				skillName: SkillsEnum.Herblore,
				amount: totalHerbloreXP,
				duration
			});
		}

		let str = `${user}, ${user.minionName} finished hunting ${creature.name}${
			crystalImpling
				? '.'
				: ` ${quantity}x times, due to clever creatures you missed out on ${
						quantity - successfulQuantity
					}x catches. `
		}${xpStr}`;

		str += `\n\nYou received: ${loot}.`;

		if (loot.amount('Baby chinchompa') > 0 || loot.amount('Herbi') > 0) {
			str += "\n\n**You have a funny feeling like you're being followed....**";
		}

		if (messages.length > 0) {
			str += `\n${messages.join('\n')}`;
		}

		if (newWildyGear) {
			await user.update({
				gear_wildy: newWildyGear.raw() as Prisma.InputJsonObject
			});
		}

		return handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
