import { increaseNumByPercent, reduceNumByPercent } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { determineMiningTime } from '../../lib/skilling/functions/determineMiningTime';
import Mining from '../../lib/skilling/skills/mining';
import { Skills } from '../../lib/types';
import { MiningActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, formatSkillRequirements, itemNameFromID, randomVariation } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { stringMatches } from '../../lib/util/cleanString';
import itemID from '../../lib/util/itemID';
import { minionName } from '../../lib/util/minionUtils';
import { OSBMahojiCommand } from '../lib/util';

export const pickaxes = [
	{
		id: itemID('Crystal pickaxe'),
		ticksBetweenRolls: 2.75,
		miningLvl: 71
	},
	{
		id: itemID('Infernal pickaxe'),
		ticksBetweenRolls: 2.83,
		miningLvl: 61
	},
	{
		id: itemID('Dragon pickaxe'),
		ticksBetweenRolls: 2.83,
		miningLvl: 61
	},
	{
		id: itemID('Rune pickaxe'),
		ticksBetweenRolls: 3,
		miningLvl: 41
	},
	{
		id: itemID('Adamant pickaxe'),
		ticksBetweenRolls: 4,
		miningLvl: 31
	},
	{
		id: itemID('Mithril pickaxe'),
		ticksBetweenRolls: 5,
		miningLvl: 21
	},
	{
		id: itemID('Black pickaxe'),
		ticksBetweenRolls: 5,
		miningLvl: 11
	},
	{
		id: itemID('Steel pickaxe'),
		ticksBetweenRolls: 6,
		miningLvl: 6
	},
	{
		id: itemID('Iron pickaxe'),
		ticksBetweenRolls: 7,
		miningLvl: 1
	},
	{
		id: itemID('Bronze pickaxe'),
		ticksBetweenRolls: 8,
		miningLvl: 1
	}
];

export const gloves = [
	{
		id: itemID('Expert mining gloves'),
		Percentages: new Bank({
			'Silver ore': 50,
			Coal: 40,
			'Gold ore': 33.33,
			'Mithril ore': 25,
			'Adamantite ore': 16.66,
			'Runite ore': 12.5,
			Amethyst: 25
		})
	},
	{
		id: itemID('Superior mining gloves'),
		Percentages: new Bank({
			'Silver ore': 0,
			Coal: 0,
			'Gold ore': 0,
			'Mithril ore': 25,
			'Adamantite ore': 16.66,
			'Runite ore': 12.5,
			Amethyst: 0
		})
	},
	{
		id: itemID('Mining gloves'),
		Percentages: new Bank({
			'Silver ore': 50,
			Coal: 40,
			'Gold ore': 33.33,
			'Mithril ore': 0,
			'Adamantite ore': 0,
			'Runite ore': 0,
			Amethyst: 0
		})
	}
];

export const varrockArmours = [
	{
		id: itemID('Varrock armour 4'),
		Percentages: new Bank({
			Clay: 10,
			'Copper ore': 10,
			'Tin ore': 10,
			'Iron ore': 10,
			'Silver ore': 10,
			Coal: 10,
			'Sandstone (5kg)': 10,
			'Gold ore': 10,
			'Granite (5kg)': 10,
			'Mithril ore': 10,
			'Adamantite ore': 10,
			'Runite ore': 10,
			Amethyst: 10
		})
	},
	{
		id: itemID('Varrock armour 3'),
		Percentages: new Bank({
			Clay: 10,
			'Copper ore': 10,
			'Tin ore': 10,
			'Iron ore': 10,
			'Silver ore': 10,
			Coal: 10,
			'Sandstone (5kg)': 10,
			'Gold ore': 10,
			'Granite (5kg)': 10,
			'Mithril ore': 10,
			'Adamantite ore': 10,
			'Runite ore': 0,
			Amethyst: 0
		})
	},
	{
		id: itemID('Varrock armour 2'),
		Percentages: new Bank({
			Clay: 10,
			'Copper ore': 10,
			'Tin ore': 10,
			'Iron ore': 10,
			'Silver ore': 10,
			Coal: 10,
			'Sandstone (5kg)': 10,
			'Gold ore': 10,
			'Granite (5kg)': 10,
			'Mithril ore': 10,
			'Adamantite ore': 0,
			'Runite ore': 0,
			Amethyst: 0
		})
	},
	{
		id: itemID('Varrock armour 1'),
		Percentages: new Bank({
			Clay: 10,
			'Copper ore': 10,
			'Tin ore': 10,
			'Iron ore': 10,
			'Silver ore': 10,
			Coal: 10,
			'Sandstone (5kg)': 0,
			'Gold ore': 0,
			'Granite (5kg)': 0,
			'Mithril ore': 0,
			'Adamantite ore': 0,
			'Runite ore': 0,
			Amethyst: 0
		})
	}
];

export const miningCapeOreEffect: Bank = new Bank({
	Clay: 5,
	'Copper ore': 5,
	'Tin ore': 5,
	'Iron ore': 5,
	'Silver ore': 5,
	Coal: 5,
	'Sandstone (5kg)': 5,
	'Gold ore': 5,
	'Granite (5kg)': 5,
	'Mithril ore': 5,
	'Adamantite ore': 5,
	'Runite ore': 0,
	Amethyst: 0
});

const daeyaltEssenceSkillRequirements: Skills = {
	woodcutting: 62,
	fletching: 60,
	crafting: 56,
	agility: 52,
	attack: 50,
	slayer: 50,
	magic: 49,
	herblore: 40,
	construction: 5,
	thieving: 22,
	strength: 40
};

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
			choices: Mining.Ores.map(i => ({
				name: i.name,
				value: i.name
			}))
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
		const ore = Mining.Ores.find(
			ore => stringMatches(ore.name, options.name) || stringMatches(ore.name.split(' ')[0], options.name)
		);

		if (!ore) {
			return `Thats not a valid ore to mine. Valid ores are ${Mining.Ores.map(ore => ore.name).join(', ')}.`;
		}

		let { quantity, powermine } = options;
		const user = await mUserFetch(userID);
		if (user.skillsAsLevels.mining < ore.level) {
			return `${minionName(user)} needs ${ore.level} Mining to mine ${ore.name}.`;
		}

		// Check for daeyalt shard requirements.
		const hasDaeyaltReqs = user.hasSkillReqs(daeyaltEssenceSkillRequirements);
		if (ore.name === 'Daeyalt essence rock') {
			if (!hasDaeyaltReqs) {
				return `To mine ${ore.name}, you need ${formatSkillRequirements(daeyaltEssenceSkillRequirements)}.`;
			}
			if (user.QP < 125) {
				return `To mine ${ore.name}, you need atleast 125 Quest Points.`;
			}
		}

		const boosts = [];

		let miningLevel = user.skillsAsLevels.mining;
		if ((ore.minerals || ore.nuggets) && miningLevel >= 60) {
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
			if (!user.hasEquippedOrInBank([pickaxe.id]) || miningLevel < pickaxe.miningLvl) continue;
			currentPickaxe = pickaxe;
			boosts.pop();
			boosts.push(`**${pickaxe.ticksBetweenRolls}** ticks between rolls for ${itemNameFromID(pickaxe.id)}`);
			break;
		}

		let glovesRate = 0;
		if (miningLevel >= 60) {
			for (const glove of gloves) {
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
		if (user.hasEquippedOrInBank([itemID('Mining cape')]) || !miningCapeOreEffect.has(ore.id)) {
			miningCapeEffect = miningCapeOreEffect.amount(ore.id);
			if (miningCapeEffect !== 0) {
				boosts.push(`**${miningCapeEffect}%** chance to mine an extra ore using Mining cape`);
			}
		}

		if (!powermine) {
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
