import { reduceNumByPercent, Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { HERBIBOAR_ID, RAZOR_KEBBIT_ID } from '../../lib/constants';
import { hasWildyHuntGearEquipped } from '../../lib/gear/functions/hasWildyHuntGearEquipped';
import { inventionBoosts, InventionID, inventionItemBoost } from '../../lib/invention/inventions';
import { monkeyTiers } from '../../lib/monkeyRumble';
import { trackLoot } from '../../lib/settings/prisma';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import creatures from '../../lib/skilling/skills/hunter/creatures';
import Hunter from '../../lib/skilling/skills/hunter/hunter';
import { HunterTechniqueEnum, SkillsEnum } from '../../lib/skilling/types';
import { HunterActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemID, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { brewRestoreSupplyCalc } from '../../lib/util/brewRestoreSupplyCalc';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { stringMatches } from '../../lib/util/cleanString';
import { userHasItemsEquippedAnywhere } from '../../lib/util/minionUtils';
import { Peak } from '../../tasks/WildernessPeakInterval';
import { OSBMahojiCommand } from '../lib/util';

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
		const user = await globalClient.fetchUser(userID);
		const userBank = user.bank();
		const userQP = user.settings.get(UserSettings.QP);
		const boosts = [];
		let traps = 1;
		let usingHuntPotion = Boolean(options.hunter_potion);
		let wildyScore = 0;

		if (options.stamina_potions === undefined) {
			options.stamina_potions = true;
		}

		let usingStaminaPotion = Boolean(options.stamina_potions);

		const creature = Hunter.Creatures.find(creature =>
			creature.aliases.some(
				alias => stringMatches(alias, options.name) || stringMatches(alias.split(' ')[0], options.name)
			)
		);

		if (!creature) return "That's not a valid creature to hunt.";

		if (
			creature.id === 3251 &&
			(user.skillLevel(SkillsEnum.Hunter) < 120 ||
				user.skillLevel(SkillsEnum.Agility) < 99 ||
				user.skillLevel(SkillsEnum.Fishing) < 99)
		) {
			return "You need level 120 Hunter, 99 Agility, 99 Fishing to hunt Sand Gecko's.";
		}

		if (
			creature.name === 'Chimpchompa' &&
			!userHasItemsEquippedAnywhere(user, monkeyTiers.map(i => i.greegrees.map(i => i.id)).flat(2), false)
		) {
			return "You can't hunt Chimpchompa's! You need to be wearing a greegree.";
		}

		if (user.skillLevel(SkillsEnum.Hunter) + (usingHuntPotion ? 2 : 0) < creature.level) {
			return `${user.minionName} needs ${creature.level} Hunter to hunt ${creature.name}.`;
		}

		if (creature.qpRequired && userQP < creature.qpRequired) {
			return `${user.minionName} needs ${creature.qpRequired} QP to hunt ${creature.name}.`;
		}

		if (creature.prayerLvl && user.skillLevel(SkillsEnum.Prayer) < creature.prayerLvl) {
			return `${user.minionName} needs ${creature.prayerLvl} Prayer to hunt ${creature.name}.`;
		}

		if (creature.herbloreLvl && user.skillLevel(SkillsEnum.Herblore) < creature.herbloreLvl) {
			return `${user.minionName} needs ${creature.herbloreLvl} Herblore to hunt ${creature.name}.`;
		}

		if (creature.multiTraps) {
			traps +=
				Math.min(Math.floor((user.skillLevel(SkillsEnum.Hunter) + (usingHuntPotion ? 2 : 0)) / 20), 5) +
				(creature.wildy ? 1 : 0);
		}

		if (creature.itemsRequired) {
			for (const [item, quantity] of creature.itemsRequired.items()) {
				if (userBank.amount(item.name) < quantity * traps) {
					return `You don't have ${traps}x ${item.name}, hunter tools can be bought using the buy command.`;
				}
			}
		}

		// Reduce time if user is experienced hunting the creature, every hour become 1% better to a cap of 10% or 20% if tracking technique.
		let [percentReduced, catchTime] = [
			Math.min(
				Math.floor(
					(user.getCreatureScore(creature) ?? 1) / (Time.Hour / ((creature.catchTime * Time.Second) / traps))
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

		if (user.hasItemEquippedAnywhere('Hunter master cape')) {
			boosts.push('2x boost for being a master hunter');
			catchTime *= 0.5;
		}

		if (creature.wildy) {
			const [bol, reason, score] = hasWildyHuntGearEquipped(user.getGear('wildy'));
			wildyScore = score;
			if (!bol) {
				return `To hunt ${creature.name} in the wilderness you need to meet the following requirement: ${reason}, check your wildy gear.`;
			}
			const { hasEnough } = brewRestoreSupplyCalc(user, 10, 5);
			if (!hasEnough) {
				if (userBank.amount('Saradomin brew(4)') < 10 || userBank.amount('Super restore(4)') < 5) {
					return `To hunt ${creature.name} in the wilderness you need to have 10x Saradomin brew(4) and 5x Super restore(4) for safety.`;
				}
			}
		}

		let timePerCatch = (catchTime * Time.Second) / traps;

		const maxTripLength = calcMaxTripLength(user, 'Hunter');
		if (creature.huntTechnique === HunterTechniqueEnum.BoxTrapping) {
			const boostRes = await inventionItemBoost({
				userID: user.id,
				inventionID: InventionID.QuickTrap,
				duration: Math.min(maxTripLength, options.quantity ? options.quantity * timePerCatch : maxTripLength)
			});
			if (boostRes.success) {
				boosts.push(
					`${inventionBoosts.quickTrap.boxTrapBoostPercent}% boost for Quick-Trap invention (${boostRes.messages})`
				);
				timePerCatch = reduceNumByPercent(timePerCatch, inventionBoosts.quickTrap.boxTrapBoostPercent);
			}
		}

		let { quantity } = options;
		if (!quantity) quantity = Math.floor(maxTripLength / timePerCatch);

		let duration = Math.floor(quantity * timePerCatch);

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${creature.name} you can hunt is ${Math.floor(
				maxTripLength / ((catchTime * Time.Second) / traps)
			)}.`;
		}

		let removeBank = new Bank();

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
		if (creature.id === HERBIBOAR_ID || creature.id === RAZOR_KEBBIT_ID) {
			let staminaPotionQuantity =
				creature.id === HERBIBOAR_ID
					? Math.round(duration / (9 * Time.Minute))
					: Math.round(duration / (18 * Time.Minute));

			if (usingStaminaPotion && userBank.amount('Stamina potion(4)') >= staminaPotionQuantity) {
				removeBank.add('Stamina potion(4)', staminaPotionQuantity);
				boosts.push(`20% boost for using ${staminaPotionQuantity}x Stamina potion(4)`);
				duration *= 0.8;
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

		if (creature.bait) {
			let reqBank = creature.bait(quantity, user);
			if (!user.owns(reqBank)) {
				return `You don't have enough bait to catch ${quantity}x ${creature.name}, you need: ${reqBank}.`;
			}
			removeBank.add(reqBank);
		}

		updateBankSetting(globalClient, ClientSettings.EconomyStats.HunterCost, removeBank);
		await user.removeItemsFromBank(removeBank);

		let wildyPeak = null;
		let wildyStr = '';

		if (creature.wildy) {
			const date = new Date().getTime();
			const cachedPeakInterval: Peak[] = globalClient._peakIntervalCache;
			for (const peak of cachedPeakInterval) {
				if (peak.startTime < date && peak.finishTime > date) {
					wildyPeak = peak;
					break;
				}
			}
			wildyStr = `You are hunting ${creature.name} in the Wilderness during ${
				wildyPeak!.peakTier
			} peak time and potentially risking your equipped body and legs in the wildy setup with a score ${wildyScore} and also risking Saradomin brews and Super restore potions.`;
		}

		await trackLoot({
			id: creature.name,
			cost: removeBank,
			type: 'Skilling',
			changeType: 'cost'
		});

		await addSubTaskToActivityTask<HunterActivityTaskOptions>({
			creatureName: creature.name,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			usingHuntPotion,
			usingStaminaPotion,
			wildyPeak,
			type: 'Hunter'
		});

		let response = `${user.minionName} is now ${creature.huntTechnique} ${quantity}x ${
			creature.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		if (wildyStr.length > 0) {
			response += `\n\n${wildyStr}`;
		}

		if (removeBank.length) {
			response += `\nRemoved ${removeBank}`;
		}

		return response;
	}
};
