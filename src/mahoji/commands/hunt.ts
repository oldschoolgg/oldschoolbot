import { Bank } from 'oldschooljs';
import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { type CommandRunOptions, formatDuration, stringMatches } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time, reduceNumByPercent } from 'e';
import { itemID } from 'oldschooljs/dist/util';
import { HERBIBOAR_ID, RAZOR_KEBBIT_ID } from '../../lib/constants';
import type { UserFullGearSetup } from '../../lib/gear';
import { hasWildyHuntGearEquipped } from '../../lib/gear/functions/hasWildyHuntGearEquipped';
import { InventionID, inventionBoosts, inventionItemBoost } from '../../lib/invention/inventions';
import { trackLoot } from '../../lib/lootTrack';
import { monkeyTiers } from '../../lib/monkeyRumble';
import { soteSkillRequirements } from '../../lib/skilling/functions/questRequirements';
import creatures from '../../lib/skilling/skills/hunter/creatures';
import Hunter from '../../lib/skilling/skills/hunter/hunter';
import { type Creature, HunterTechniqueEnum } from '../../lib/skilling/types';
import type { Peak } from '../../lib/tickers';
import type { Skills } from '../../lib/types';
import type { HunterActivityTaskOptions } from '../../lib/types/minions';
import { hasSkillReqs } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import type { OSBMahojiCommand } from '../lib/util';
import { userHasGracefulEquipped } from '../mahojiSettings';

export function calculateHunterInput({
	skillsAsLevels,
	isUsingHunterPotion,
	shouldUseStaminaPotions = true,
	quantityInput,
	hasHunterMasterCape,
	hasGraceful,
	creatureScores,
	maxTripLength,
	allGear,
	QP,
	creature,
	bank,
	isUsingQuickTrap,
	quickTrapMessages,
	isUsingWebshooter,
	webshooterMessages,
	user
}: {
	creature: Creature;
	bank: Bank;
	QP: number;
	creatureScores: ItemBank;
	quantityInput?: number;
	shouldUseStaminaPotions: boolean;
	skillsAsLevels: Required<Skills>;
	isUsingHunterPotion: boolean;
	hasHunterMasterCape: boolean;
	hasGraceful: boolean;
	maxTripLength: number;
	allGear: UserFullGearSetup;
	isUsingQuickTrap: boolean;
	quickTrapMessages: string | undefined;
	isUsingWebshooter: boolean;
	webshooterMessages: string | undefined;
	user: MUser;
}) {
	const messages: string[] = [];
	let traps = 1;
	let wildyScore = 0;

	if (
		creature.id === 3251 &&
		(skillsAsLevels.hunter < 120 || skillsAsLevels.agility < 99 || skillsAsLevels.fishing < 99)
	) {
		return "You need level 120 Hunter, 99 Agility, 99 Fishing to hunt Sand Gecko's.";
	}

	if (
		creature.name === 'Chimpchompa' &&
		!Object.values(allGear).some(g =>
			g.hasEquipped(monkeyTiers.map(i => i.greegrees.map(i => i.id)).flat(2), false)
		)
	) {
		return "You can't hunt Chimpchompa's! You need to be wearing a greegree.";
	}

	const crystalImpling = creature.name === 'Crystal impling';

	if (crystalImpling) {
		const [hasReqs, reason] = hasSkillReqs(user, soteSkillRequirements);
		if (!hasReqs) {
			return `To hunt ${creature.name}, you need: ${reason}.`;
		}
		if (user.QP < 150) {
			return `To hunt ${creature.name}, you need 150 QP.`;
		}
	}

	if (skillsAsLevels.hunter + (isUsingHunterPotion ? 2 : 0) < creature.level) {
		return `You need needs ${creature.level} Hunter to hunt ${creature.name}.`;
	}

	if (creature.qpRequired && QP < creature.qpRequired) {
		return `You need ${creature.qpRequired} QP to hunt ${creature.name}.`;
	}

	if (creature.prayerLvl && skillsAsLevels.prayer < creature.prayerLvl) {
		return `You need ${creature.prayerLvl} Prayer to hunt ${creature.name}.`;
	}

	if (creature.herbloreLvl && skillsAsLevels.herblore < creature.herbloreLvl) {
		return `You need need ${creature.herbloreLvl} Herblore to hunt ${creature.name}.`;
	}

	if (creature.multiTraps) {
		traps +=
			Math.min(Math.floor((skillsAsLevels.hunter + (isUsingHunterPotion ? 2 : 0)) / 20), 5) +
			(creature.wildy ? 1 : 0);
	}

	if (creature.itemsRequired) {
		for (const [item, quantity] of creature.itemsRequired.items()) {
			if (bank.amount(item.name) < quantity * traps) {
				return `You don't have ${traps}x ${item.name}, hunter tools can be bought using the buy command.`;
			}
		}
	}

	// Reduce time if user is experienced hunting the creature, every hour become 1% better to a cap of 10% or 20% if tracking technique.
	let [percentReduced, catchTime] = [
		Math.min(
			Math.floor((creatureScores[creature.id] ?? 0) / (Time.Hour / ((creature.catchTime * Time.Second) / traps))),
			creature.huntTechnique === HunterTechniqueEnum.Tracking ? 20 : 10
		),
		creature.catchTime
	];

	catchTime *= (100 - percentReduced) / 100;

	if (percentReduced >= 1) messages.push(`${percentReduced}% for being experienced hunting this creature`);

	// Reduce time by 5% if user has graceful equipped
	if (!creature.wildy && hasGraceful) {
		messages.push('5% boost for using Graceful');
		catchTime *= 0.95;
	}

	if (hasHunterMasterCape) {
		messages.push('2x boost for being a master hunter');
		catchTime *= 0.5;
	}

	if (creature.wildy) {
		const [bol, reason, score] = hasWildyHuntGearEquipped(allGear.wildy);
		wildyScore = score;
		if (!bol) {
			return `To hunt ${creature.name} in the wilderness you need to meet the following requirement: ${reason}, check your wildy gear.`;
		}
		if (bank.amount('Saradomin brew(4)') < 10 || bank.amount('Super restore(4)') < 5) {
			return `To hunt ${creature.name} in the wilderness you need to have 10x Saradomin brew(4) and 5x Super restore(4) for safety.`;
		}
	}

	let timePerCatch = (catchTime * Time.Second) / traps;
	if (creature.id === HERBIBOAR_ID || creature.id === RAZOR_KEBBIT_ID) {
		if (shouldUseStaminaPotions) catchTime *= 0.8;
	}

	if (creature.huntTechnique === HunterTechniqueEnum.BoxTrapping && isUsingQuickTrap) {
		const boostedActionTime = reduceNumByPercent(timePerCatch, inventionBoosts.quickTrap.boxTrapBoostPercent);
		messages.push(
			`${inventionBoosts.quickTrap.boxTrapBoostPercent}% boost for Quick-Trap invention (${quickTrapMessages})`
		);
		timePerCatch = boostedActionTime;
	}

	if (isUsingWebshooter) {
		const boostedActionTime = reduceNumByPercent(timePerCatch, inventionBoosts.webshooter.hunterBoostPercent);
		messages.push(
			`${inventionBoosts.webshooter.hunterBoostPercent}% boost for Webshooter invention (${webshooterMessages})`
		);
		timePerCatch = boostedActionTime;
	}

	const maxQuantity = Math.floor(maxTripLength / timePerCatch);
	let quantity = quantityInput;
	if (!quantity) {
		if (crystalImpling) {
			quantity = Math.floor(maxTripLength / Time.Minute);
		} else {
			quantity = maxQuantity;
		}
	}

	let duration = Math.floor(quantity * timePerCatch);

	if (crystalImpling) {
		duration = Math.floor(quantity * Time.Minute);
	}

	if (duration > maxTripLength) {
		return `You can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of ${creature.name} you can hunt is ${maxQuantity}.`;
	}

	const totalCost = new Bank();

	if (creature.itemsConsumed) {
		for (const [item, qty] of creature.itemsConsumed.items()) {
			if (bank.amount(item.id) < qty * quantity) {
				if (bank.amount(item.id) > qty) {
					quantity = Math.floor(bank.amount(item.id) / qty);
					duration = Math.floor(((quantity * catchTime) / traps) * Time.Second);
				} else {
					return `You don't have enough ${item.name}s.`;
				}
			}
			totalCost.add(item.id, qty * quantity);
		}
	}

	// If creatures Herbiboar or Razor-backed kebbit or Crystal Impling use Stamina potion(4)
	if (shouldUseStaminaPotions) {
		if (creature.id === HERBIBOAR_ID || creature.id === RAZOR_KEBBIT_ID || crystalImpling) {
			const staminaPotionQuantity =
				creature.id === HERBIBOAR_ID || crystalImpling
					? Math.round(duration / (9 * Time.Minute))
					: Math.round(duration / (18 * Time.Minute));

			if (bank.amount('Stamina potion(4)') < staminaPotionQuantity) {
				return `You need ${staminaPotionQuantity}x Stamina potion(4) to hunt for the whole trip, try a lower quantity or make/buy more potions.`;
			}
			totalCost.add('Stamina potion(4)', staminaPotionQuantity);
			messages.push(`20% boost for using ${staminaPotionQuantity}x Stamina potion(4)`);
		}
	}

	if (isUsingHunterPotion) {
		const hunterPotionQuantity = Math.round(duration / (8 * Time.Minute));
		if (bank.amount('Hunter potion(4)') < hunterPotionQuantity) {
			return `You need ${hunterPotionQuantity}x Hunter potion(4) to boost your level for the whole trip, try a lower quantity or make/buy more potions.`;
		}
		totalCost.add(itemID('Hunter potion(4)'), hunterPotionQuantity);
		messages.push(`+2 hunter level for using ${hunterPotionQuantity}x Hunter potion(4) every 2nd minute.`);
	}

	if (creature.bait) {
		const reqBank = creature.bait(quantity);
		if (!bank.has(reqBank)) {
			return `You don't have enough bait to catch ${quantity}x ${creature.name}, you need: ${reqBank}.`;
		}
		totalCost.add(reqBank);
	}

	let wildyPeak = null;

	if (creature.wildy) {
		const date = new Date().getTime();
		const cachedPeakInterval: Peak[] = globalClient._peakIntervalCache;
		for (const peak of cachedPeakInterval) {
			if (peak.startTime < date && peak.finishTime > date) {
				wildyPeak = peak;
				break;
			}
		}
		messages.push(
			`You are hunting ${creature.name} in the Wilderness during ${
				wildyPeak!.peakTier
			} peak time and potentially risking your equipped body and legs in the wildy setup with a score ${wildyScore} and also risking Saradomin brews and Super restore potions.`
		);
	}

	return {
		creature,
		quantity,
		duration,
		totalCost,
		boosts: messages,
		isUsingHunterPotion,
		shouldUseStaminaPotions,
		wildyPeak,
		messages
	};
}

export const huntCommand: OSBMahojiCommand = {
	name: 'hunt',
	description: 'Hunt creatures with the Hunter skill.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/hunt name:Ferret']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The creature you want to hunt.',
			required: true,
			autocomplete: async (value: string) => {
				return creatures
					.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
					.map(i => ({
						name: i.name,
						value: i.name
					}));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to hunt (optional).',
			required: false,
			min_value: 1
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'hunter_potion',
			description: 'Do you want to use Hunter potions for this trip?',
			required: false
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'stamina_potions',
			description: 'Use stam potions for Herbiboar?',
			required: false
		}
	],
	run: async ({
		options,
		userID,
		channelID
	}: CommandRunOptions<{ name: string; quantity?: number; hunter_potion?: boolean; stamina_potions?: boolean }>) => {
		const user = await mUserFetch(userID);
		const creature = Hunter.Creatures.find(creature =>
			creature.aliases.some(
				alias => stringMatches(alias, options.name) || stringMatches(alias.split(' ')[0], options.name)
			)
		);

		if (!creature) return "That's not a valid creature to hunt.";

		const crystalImpling = creature.name === 'Crystal impling';

		const maxTripLength = calcMaxTripLength(user, 'Hunter');
		const elligibleForQuickTrap =
			creature.huntTechnique === HunterTechniqueEnum.BoxTrapping && user.owns('Quick trap');
		const elligibleForWebshooter = user.owns('Webshooter') && !crystalImpling;

		const hunterInputArgs: Parameters<typeof calculateHunterInput>['0'] = {
			creature,
			hasHunterMasterCape: user.hasEquipped('Hunter master cape'),
			hasGraceful: userHasGracefulEquipped(user),
			maxTripLength,
			quantityInput: options.quantity,
			skillsAsLevels: user.skillsAsLevels,
			isUsingHunterPotion: options.hunter_potion ?? false,
			shouldUseStaminaPotions: options.stamina_potions ?? true,
			creatureScores: (await user.fetchStats({ creature_scores: true })).creature_scores as ItemBank,
			allGear: user.gear,
			QP: user.QP,
			bank: user.bank,
			isUsingQuickTrap: elligibleForQuickTrap,
			quickTrapMessages: undefined,
			isUsingWebshooter: elligibleForWebshooter,
			webshooterMessages: undefined,
			user
		};

		const preResult = calculateHunterInput({
			...hunterInputArgs
		});

		if (typeof preResult === 'string') {
			return preResult;
		}

		const quickTrapResult = elligibleForQuickTrap
			? await inventionItemBoost({
					user,
					inventionID: InventionID.QuickTrap,
					duration: preResult.duration
			  })
			: null;

		const webshooterResult = elligibleForWebshooter
			? await inventionItemBoost({
					user,
					inventionID: InventionID.Webshooter,
					duration: preResult.duration
			  })
			: null;

		const result = calculateHunterInput({
			...hunterInputArgs,
			isUsingQuickTrap: quickTrapResult?.success ?? false,
			quickTrapMessages: quickTrapResult?.success ? quickTrapResult.messages : undefined,
			webshooterMessages: webshooterResult?.success ? webshooterResult.messages : undefined,
			isUsingWebshooter: webshooterResult?.success ?? false
		});

		if (typeof result === 'string') {
			return result;
		}

		const { wildyPeak, messages, totalCost, quantity, duration, isUsingHunterPotion, shouldUseStaminaPotions } =
			result;

		await user.removeItemsFromBank(totalCost);
		await updateBankSetting('hunter_cost', totalCost);
		await trackLoot({
			id: creature.name,
			totalCost,
			type: 'Skilling',
			changeType: 'cost',
			users: [
				{
					id: user.id,
					cost: totalCost
				}
			]
		});
		await addSubTaskToActivityTask<HunterActivityTaskOptions>({
			creatureName: creature.name,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			usingHuntPotion: isUsingHunterPotion,
			usingStaminaPotion: shouldUseStaminaPotions,
			wildyPeak,
			type: 'Hunter'
		});

		let response = `${user.minionName} is now ${crystalImpling ? 'hunting' : `${creature.huntTechnique}`} ${
			crystalImpling ? '' : ` ${quantity}x `
		}${creature.name}, it'll take around ${formatDuration(duration)} to finish.`;

		if (messages.length > 0) {
			response += `\n\n${messages.join(', ')}.`;
		}

		if (totalCost.length > 0) {
			response += `\nRemoved ${totalCost}`;
		}

		return response;
	}
};
