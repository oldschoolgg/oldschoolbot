import { reduceNumByPercent } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import Mining from '../../lib/skilling/skills/mining';
import { MiningActivityTaskOptions } from '../../lib/types/minions';
import { determineScaledOreTime, formatDuration, itemNameFromID } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { stringMatches } from '../../lib/util/cleanString';
import itemID from '../../lib/util/itemID';
import { hasItemsEquippedOrInBank, minionName, userHasItemsEquippedAnywhere } from '../../lib/util/minionUtils';
import { OSBMahojiCommand } from '../lib/util';
import { getSkillsOfMahojiUser, mahojiUsersSettingsFetch } from '../mahojiSettings';

const pickaxes = [
	{
		id: itemID('Volcanic pickaxe'),
		reductionPercent: 60,
		miningLvl: 105
	},
	{
		id: itemID('Dwarven pickaxe'),
		reductionPercent: 50,
		miningLvl: 99
	},
	{
		id: itemID('3rd age pickaxe'),
		reductionPercent: 11,
		miningLvl: 61
	},
	{
		id: itemID('Crystal pickaxe'),
		reductionPercent: 11,
		miningLvl: 71
	},
	{
		id: itemID('Infernal pickaxe'),
		reductionPercent: 6,
		miningLvl: 61
	},
	{
		id: itemID('Dragon pickaxe'),
		reductionPercent: 6,
		miningLvl: 61
	}
];

const gloves = [
	{
		id: itemID('Expert mining gloves'),
		reductionPercent: 6
	},
	{
		id: itemID('Superior mining gloves'),
		reductionPercent: 4
	},
	{
		id: itemID('Mining gloves'),
		reductionPercent: 2
	}
];

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
		}
	],
	run: async ({ options, userID, channelID }: CommandRunOptions<{ name: string; quantity?: number }>) => {
		const ore = Mining.Ores.find(
			ore => stringMatches(ore.name, options.name) || stringMatches(ore.name.split(' ')[0], options.name)
		);

		if (!ore) {
			return `Thats not a valid ore to mine. Valid ores are ${Mining.Ores.map(ore => ore.name).join(', ')}.`;
		}

		let { quantity } = options;
		const user = await mahojiUsersSettingsFetch(userID);
		const skills = getSkillsOfMahojiUser(user, true);
		if (skills.mining < ore.level) {
			return `${minionName(user)} needs ${ore.level} Mining to mine ${ore.name}.`;
		}

		if (ore.requiredPickaxes) {
			if (!hasItemsEquippedOrInBank(user, ore.requiredPickaxes, 'one')) {
				return `You need to be using one of these pickaxes to be able to mine ${
					ore.name
				}: ${ore.requiredPickaxes.map(itemNameFromID).join(', ')}.`;
			}
		}

		// Calculate the time it takes to mine a single ore of this type, at this persons level.
		let timeToMine = determineScaledOreTime(ore!.xp, ore.respawnTime, skills.mining);

		// For each pickaxe, if they have it, give them its' bonus and break.
		const boosts = [];
		for (const pickaxe of pickaxes) {
			if (hasItemsEquippedOrInBank(user, [pickaxe.id]) && skills.mining >= pickaxe.miningLvl) {
				timeToMine = reduceNumByPercent(timeToMine, pickaxe.reductionPercent);
				boosts.push(`${pickaxe.reductionPercent}% for ${itemNameFromID(pickaxe.id)}`);
				break;
			}
		}
		if (skills.mining >= 60) {
			for (const glove of gloves) {
				if (userHasItemsEquippedAnywhere(user, glove.id)) {
					timeToMine = reduceNumByPercent(timeToMine, glove.reductionPercent);
					boosts.push(`${glove.reductionPercent}% for ${itemNameFromID(glove.id)}`);
					break;
				}
			}
		}
		// Give gem rocks a speed increase for wearing a glory
		if (ore.id === 1625 && userHasItemsEquippedAnywhere(user, 'Amulet of glory')) {
			timeToMine = Math.floor(timeToMine / 2);
			boosts.push('50% for having an Amulet of glory equipped');
		}

		if (
			userHasItemsEquippedAnywhere(user, 'Offhand volcanic pickaxe') &&
			skills.strength >= 100 &&
			skills.mining >= 105
		) {
			timeToMine = reduceNumByPercent(timeToMine, 60);
			boosts.push('60% for Offhand volcanic pickaxe');
		}

		const maxTripLength = calcMaxTripLength(user, 'Mining');

		// If no quantity provided, set it to the max.
		if (!quantity) {
			quantity = Math.floor(maxTripLength / timeToMine);
		}
		const duration = quantity * timeToMine;

		if (duration > maxTripLength) {
			return `${minionName(user)} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${ore.name} you can mine is ${Math.floor(
				maxTripLength / timeToMine
			)}.`;
		}

		await addSubTaskToActivityTask<MiningActivityTaskOptions>({
			oreID: ore.id,
			userID: userID.toString(),
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'Mining'
		});

		let response = `${minionName(user)} is now mining ${quantity}x ${ore.name}, it'll take around ${formatDuration(
			duration
		)} to finish.`;

		const kUser = await globalClient.fetchUser(userID);
		if (kUser.usingPet('Doug')) {
			response += '\n<:doug:748892864813203591> Doug joins you on your mining trip!';
		}

		if (boosts.length > 0) {
			response += `\n\n **Boosts:** ${boosts.join(', ')}.`;
		}

		return response;
	}
};
