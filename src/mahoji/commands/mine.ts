import { stringMatches } from '@oldschoolgg/toolkit';
import { increaseNumByPercent, reduceNumByPercent } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { determineMiningTime } from '../../lib/skilling/functions/determineMiningTime';
import { miningCapeOreEffect, miningGloves, pickaxes, varrockArmours } from '../../lib/skilling/functions/miningBoosts';
import { sinsOfTheFatherSkillRequirements } from '../../lib/skilling/functions/questRequirements';
import Mining from '../../lib/skilling/skills/mining';
import { MiningActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, formatSkillRequirements, itemNameFromID, randomVariation } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';
import { minionName } from '../../lib/util/minionUtils';
import { motherlodeMineCommand } from '../lib/abstracted_commands/motherlodeMineCommand';
import { OSBMahojiCommand } from '../lib/util';

export const mineCommand: OSBMahojiCommand = {
	name: 'mine',
	description: 'Send your minion to mine things.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/mine name:Runite ore']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The thing you want to mine.',
			required: true,
			autocomplete: async (value: string) => {
				return [...Mining.Ores.map(i => i.name), Mining.MotherlodeMine.name]
					.filter(name => (!value ? true : name.toLowerCase().includes(value.toLowerCase())))
					.map(i => ({
						name: i,
						value: i
					}));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to mine (optional).',
			required: false,
			min_value: 1
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'powermine',
			description: 'Set this to true to powermine. Higher xp/hour, No loot (default false, optional).',
			required: false
		}
	],
	run: async ({
		options,
		userID,
		channelID
	}: CommandRunOptions<{ name: string; quantity?: number; powermine?: boolean }>) => {
		const user = await mUserFetch(userID);
		let { quantity, powermine } = options;

		const motherlodeMine =
			stringMatches(Mining.MotherlodeMine.name, options.name) ||
			Mining.MotherlodeMine.aliases!.some(a => stringMatches(a, options.name));

		if (motherlodeMine) {
			return motherlodeMineCommand({ user, channelID, quantity });
		}

		const ore = Mining.Ores.find(
			ore =>
				stringMatches(ore.id, options.name) ||
				stringMatches(ore.name, options.name) ||
				(ore.aliases && ore.aliases.some(a => stringMatches(a, options.name)))
		);
		if (!ore) {
			return `Thats not a valid ore to mine. Valid ores are ${Mining.Ores.map(ore => ore.name).join(', ')}, or ${
				Mining.MotherlodeMine.name
			}.`;
		}

		if (user.skillsAsLevels.mining < ore.level) {
			return `${minionName(user)} needs ${ore.level} Mining to mine ${ore.name}.`;
		}

		// Check for daeyalt shard requirements.
		const hasDaeyaltReqs = user.hasSkillReqs(sinsOfTheFatherSkillRequirements);
		if (ore.name === 'Daeyalt essence rock') {
			if (!hasDaeyaltReqs) {
				return `To mine ${ore.name}, you need ${formatSkillRequirements(sinsOfTheFatherSkillRequirements)}.`;
			}
			if (user.QP < 125) {
				return `To mine ${ore.name}, you need atleast 125 Quest Points.`;
			}
		}

		const boosts = [];
		// Invisible mining level, dosen't help equip pickaxe etc
		let miningLevel = user.skillsAsLevels.mining;
		if (ore.minerals && miningLevel >= 60) {
			boosts.push('+7 invisible Mining lvls at the Mining guild');
			miningLevel += 7;
		}
		// Checks if user own Celestial ring or Celestial signet
		if (user.hasEquippedOrInBank(['Celestial ring (uncharged)'])) {
			boosts.push('+4 invisible Mining lvls for Celestial ring');
			miningLevel += 4;
		}
		// Default bronze pickaxe, last in the array
		let currentPickaxe = pickaxes[pickaxes.length - 1];
		boosts.push(
			`**${currentPickaxe.ticksBetweenRolls}** ticks between rolls for ${itemNameFromID(currentPickaxe.id)}`
		);

		// For each pickaxe, if they have it, give them its' bonus and break.
		for (const pickaxe of pickaxes) {
			if (!user.hasEquippedOrInBank([pickaxe.id]) || user.skillsAsLevels.mining < pickaxe.miningLvl) continue;
			currentPickaxe = pickaxe;
			boosts.pop();
			boosts.push(`**${pickaxe.ticksBetweenRolls}** ticks between rolls for ${itemNameFromID(pickaxe.id)}`);
			break;
		}

		let glovesRate = 0;
		if (user.skillsAsLevels.mining >= 60) {
			for (const glove of miningGloves) {
				if (!user.hasEquipped(glove.id) || !glove.Percentages.has(ore.id)) continue;
				glovesRate = glove.Percentages.amount(ore.id);
				if (glovesRate !== 0) {
					boosts.push(`Lowered rock depletion rate by **${glovesRate}%** for ${itemNameFromID(glove.id)}`);
					break;
				}
			}
		}

		let armourEffect = 0;
		for (const armour of varrockArmours) {
			if (!user.hasEquippedOrInBank(armour.id) || !armour.Percentages.has(ore.id)) continue;
			armourEffect = armour.Percentages.amount(ore.id);
			if (armourEffect !== 0) {
				boosts.push(`**${armourEffect}%** chance to mine an extra ore using ${itemNameFromID(armour.id)}`);
				break;
			}
		}

		let goldSilverBoost = false;
		if (user.skillsAsLevels.crafting >= 99 && (ore.name === 'Gold ore' || ore.name === 'Silver ore')) {
			goldSilverBoost = true;
			boosts.push(`**70%** faster ${ore.name} banking for 99 Crafting`);
		}

		let miningCapeEffect = 0;
		if (user.hasEquippedOrInBank([itemID('Mining cape')]) && miningCapeOreEffect.has(ore.id)) {
			miningCapeEffect = miningCapeOreEffect.amount(ore.id);
			if (miningCapeEffect !== 0) {
				boosts.push(`**${miningCapeEffect}%** chance to mine an extra ore using Mining cape`);
			}
		}

		if (!powermine || ore.bankingTime === 0) {
			powermine = false;
		} else {
			boosts.push('**Powermining**');
		}
		// Calculate the time it takes to mine specific quantity or as many as possible
		let [timeToMine, newQuantity] = determineMiningTime({
			quantity,
			user,
			ore,
			ticksBetweenRolls: currentPickaxe.ticksBetweenRolls,
			glovesRate,
			armourEffect,
			miningCapeEffect,
			powermining: powermine,
			goldSilverBoost,
			miningLvl: miningLevel
		});

		const duration = timeToMine;

		const fakeDurationMin = quantity ? randomVariation(reduceNumByPercent(duration, 25), 20) : duration;
		const fakeDurationMax = quantity ? randomVariation(increaseNumByPercent(duration, 25), 20) : duration;

		if (ore.name === 'Gem rock' && user.hasEquipped('Amulet of glory')) {
			boosts.push('3x success rate for having an Amulet of glory equipped');
		}

		await addSubTaskToActivityTask<MiningActivityTaskOptions>({
			oreID: ore.id,
			userID: userID.toString(),
			channelID: channelID.toString(),
			quantity: newQuantity,
			iQty: options.quantity ? options.quantity : undefined,
			powermine,
			duration,
			fakeDurationMax,
			fakeDurationMin,
			type: 'Mining'
		});

		let response = `${minionName(user)} is now mining ${ore.name} until your minion ${
			quantity ? `mined ${quantity}x or gets tired` : 'is satisfied'
		}, it'll take ${
			quantity
				? `between ${formatDuration(fakeDurationMin)} **and** ${formatDuration(fakeDurationMax)}`
				: formatDuration(duration)
		} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return response;
	}
};
