import { formatDuration, stringMatches, Time } from '@oldschoolgg/toolkit';
import { Bank, ECreature, itemID } from 'oldschooljs';

import { hasWildyHuntGearEquipped } from '@/lib/gear/functions/hasWildyHuntGearEquipped.js';
import { trackLoot } from '@/lib/lootTrack.js';
import { soteSkillRequirements } from '@/lib/skilling/functions/questRequirements.js';
import Hunter from '@/lib/skilling/skills/hunter/hunter.js';
import { HunterTechniqueEnum } from '@/lib/skilling/types.js';
import type { HunterActivityTaskOptions } from '@/lib/types/minions.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';
import { generateDailyPeakIntervals, type Peak } from '@/lib/util/peaks.js';
import { hasSkillReqs } from '@/lib/util/smallUtils.js';
export const huntCommand = defineCommand({
	name: 'hunt',
	description: 'Hunt creatures with the Hunter skill.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/hunt name:Ferret']
	},
	options: [
		{
			type: 'String',
			name: 'name',
			description: 'The creature you want to hunt.',
			required: true,
			autocomplete: async ({ value }: StringAutoComplete) => {
				return Hunter.Creatures.filter(i =>
					!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
				).map(i => ({
					name: i.name,
					value: i.name
				}));
			}
		},
		{
			type: 'Integer',
			name: 'quantity',
			description: 'The quantity you want to hunt (optional).',
			required: false,
			min_value: 1
		},
		{
			type: 'Boolean',
			name: 'hunter_potion',
			description: 'Do you want to use Hunter potions for this trip?',
			required: false
		},
		{
			type: 'Boolean',
			name: 'stamina_potions',
			description: 'Use stam potions for Herbiboar?',
			required: false
		}
	],
	run: async ({ options, user, channelId }) => {
		const userBank = user.bank;
		const userQP = user.QP;
		const boosts = [];
		let traps = 1;
		const usingHuntPotion = Boolean(options.hunter_potion);
		let wildyScore = 0;

		if (options.stamina_potions === undefined) {
			options.stamina_potions = true;
		}

		const usingStaminaPotion = Boolean(options.stamina_potions);

		const creature = Hunter.Creatures.find(creature =>
			creature.aliases.some(
				alias => stringMatches(alias, options.name) || stringMatches(alias.split(' ')[0], options.name)
			)
		);

		if (!creature) return "That's not a valid creature to hunt.";

		if (user.skillsAsLevels.hunter + (usingHuntPotion ? 2 : 0) < creature.level) {
			return `${user.minionName} needs ${creature.level} Hunter to hunt ${creature.name}.`;
		}

		if (creature.qpRequired && userQP < creature.qpRequired) {
			return `${user.minionName} needs ${creature.qpRequired} QP to hunt ${creature.name}.`;
		}

		if (creature.prayerLvl && user.skillsAsLevels.prayer < creature.prayerLvl) {
			return `${user.minionName} needs ${creature.prayerLvl} Prayer to hunt ${creature.name}.`;
		}

		if (creature.herbloreLvl && user.skillsAsLevels.herblore < creature.herbloreLvl) {
			return `${user.minionName} needs ${creature.herbloreLvl} Herblore to hunt ${creature.name}.`;
		}

		if (creature.multiTraps) {
			traps +=
				Math.min(Math.floor((user.skillsAsLevels.hunter + (usingHuntPotion ? 2 : 0)) / 20), 5) +
				(creature.wildy ? 1 : 0);
		}

		if (creature.itemsRequired) {
			for (const [item, quantity] of creature.itemsRequired.items()) {
				if (userBank.amount(item.name) < quantity * traps) {
					return `You don't have ${traps}x ${item.name}, hunter tools can be bought using the buy command.`;
				}
			}
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

		// Reduce time if user is experienced hunting the creature, every hour become 1% better to a cap of 10% or 20% if tracking technique.
		let [percentReduced, catchTime] = [
			Math.min(
				Math.floor(
					(await user.getCreatureScore(creature.id)) /
						(Time.Hour / ((creature.catchTime * Time.Second) / traps))
				),
				creature.huntTechnique === HunterTechniqueEnum.Tracking ? 20 : 10
			),
			creature.catchTime
		];

		catchTime *= (100 - percentReduced) / 100;

		if (percentReduced >= 1) boosts.push(`${percentReduced}% for being experienced hunting this creature`);

		// Reduce time by 5% if user has graceful equipped
		if (!creature.wildy && user.hasGracefulEquipped()) {
			boosts.push('5% boost for using Graceful');
			catchTime *= 0.95;
		}

		if (creature.wildy) {
			const [bol, reason, score] = hasWildyHuntGearEquipped(user.gear.wildy);
			wildyScore = score;
			if (!bol) {
				return `To hunt ${creature.name} in the wilderness you need to meet the following requirement: ${reason}, check your wildy gear.`;
			}
			if (userBank.amount('Saradomin brew(4)') < 10 || userBank.amount('Super restore(4)') < 5) {
				return `To hunt ${creature.name} in the wilderness you need to have 10x Saradomin brew(4) and 5x Super restore(4) for safety.`;
			}
		}

		if (creature.id === ECreature.HERBIBOAR || creature.id === ECreature.RAZOR_BACKED_KEBBIT) {
			if (usingStaminaPotion) catchTime *= 0.8;
		}

		const maxTripLength = await user.calcMaxTripLength('Hunter');

		let { quantity } = options;
		if (!quantity) {
			if (crystalImpling) {
				quantity = Math.floor(maxTripLength / Time.Minute);
			} else {
				quantity = Math.floor(maxTripLength / ((catchTime * Time.Second) / traps));
			}
		}

		let duration = Math.floor(((quantity * catchTime) / traps) * Time.Second);

		if (crystalImpling) {
			duration = Math.floor(quantity * Time.Minute);
		}

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${creature.name} you can hunt is ${Math.floor(
				maxTripLength / ((catchTime * Time.Second) / traps)
			)}.`;
		}

		const removeBank = new Bank();

		if (creature.itemsConsumed) {
			for (const [item, qty] of creature.itemsConsumed.items()) {
				if (userBank.amount(item.id) < qty * quantity) {
					if (userBank.amount(item.id) > qty) {
						quantity = Math.floor(userBank.amount(item.id) / qty);
						duration = Math.floor(((quantity * catchTime) / traps) * Time.Second);
					} else {
						return `You don't have enough ${item.name}s.`;
					}
				}
				removeBank.add(item.id, qty * quantity);
			}
		}

		// If creatures Herbiboar or Razor-backed kebbit use Stamina potion(4)
		if (usingStaminaPotion) {
			if (
				creature.id === ECreature.HERBIBOAR ||
				creature.id === ECreature.RAZOR_BACKED_KEBBIT ||
				crystalImpling
			) {
				const staminaPotionQuantity =
					creature.id === ECreature.HERBIBOAR || crystalImpling
						? Math.round(duration / (9 * Time.Minute))
						: Math.round(duration / (18 * Time.Minute));

				if (userBank.amount('Stamina potion(4)') < staminaPotionQuantity) {
					return `You need ${staminaPotionQuantity}x Stamina potion(4) to hunt for the whole trip, try a lower quantity or make/buy more potions.`;
				}
				removeBank.add('Stamina potion(4)', staminaPotionQuantity);
				boosts.push(`20% boost for using ${staminaPotionQuantity}x Stamina potion(4)`);
			}
		}

		if (usingHuntPotion) {
			const hunterPotionQuantity = Math.round(duration / (8 * Time.Minute));
			if (userBank.amount('Hunter potion(4)') < hunterPotionQuantity) {
				return `You need ${hunterPotionQuantity}x Hunter potion(4) to boost your level for the whole trip, try a lower quantity or make/buy more potions.`;
			}
			removeBank.add(itemID('Hunter potion(4)'), hunterPotionQuantity);
			boosts.push(`+2 hunter level for using ${hunterPotionQuantity}x Hunter potion(4) every 2nd minute.`);
		}

		await ClientSettings.updateBankSetting('hunter_cost', removeBank);
		await user.removeItemsFromBank(removeBank);

		let wildyPeak = null;
		let wildyStr = '';

		if (creature.wildy) {
			const date = Date.now();
			const cachedPeakInterval: Peak[] = generateDailyPeakIntervals().peaks;
			for (const peak of cachedPeakInterval) {
				if (peak.startTime < date && peak.finishTime > date) {
					wildyPeak = peak;
					break;
				}
			}
			wildyStr = `You are hunting ${creature.name} in the Wilderness during ${
				wildyPeak?.peakTier
			} peak time and potentially risking your equipped body and legs in the wildy setup with a score ${wildyScore} and also risking Saradomin brews and Super restore potions.`;
		}

		await trackLoot({
			id: creature.name,
			totalCost: removeBank,
			type: 'Skilling',
			changeType: 'cost',
			users: [
				{
					id: user.id,
					cost: removeBank
				}
			]
		});

		await ActivityManager.startTrip<HunterActivityTaskOptions>({
			creatureID: creature.id,
			userID: user.id,
			channelId,
			quantity,
			duration,
			usingHuntPotion: usingHuntPotion ? true : undefined,
			usingStaminaPotion,
			wildyPeak: wildyPeak ? wildyPeak : undefined,
			type: 'Hunter'
		});

		let response = `${user.minionName} is now ${crystalImpling ? 'hunting' : `${creature.huntTechnique}`}${
			crystalImpling ? ' ' : ` ${quantity}x `
		}${creature.name}, it'll take around ${await formatTripDuration(user, duration)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		if (wildyStr.length > 0) {
			response += `\n\n${wildyStr}`;
		}

		return response;
	}
});
