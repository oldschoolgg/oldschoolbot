import { reduceNumByPercent } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import Mining from '../../lib/skilling/skills/mining';
import { MiningActivityTaskOptions } from '../../lib/types/minions';
import { determineScaledOreTime, formatDuration, itemNameFromID } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { stringMatches } from '../../lib/util/cleanString';
import itemID from '../../lib/util/itemID';
import { OSBMahojiCommand } from '../lib/util';
import { mUserFetch } from '../mahojiSettings';

const pickaxes = [
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
		const user = await mUserFetch(userID);
		const skills = user.skillsAsLevels;
		if (skills.mining < ore.level) {
			return `${user.minionName} needs ${ore.level} Mining to mine ${ore.name}.`;
		}

		// Calculate the time it takes to mine a single ore of this type, at this persons level.
		let timeToMine = determineScaledOreTime(ore!.xp, ore.respawnTime, skills.mining);

		// For each pickaxe, if they have it, give them its' bonus and break.
		const boosts = [];
		for (const pickaxe of pickaxes) {
			if (user.hasEquippedOrInBank([pickaxe.id]) && skills.mining >= pickaxe.miningLvl) {
				timeToMine = reduceNumByPercent(timeToMine, pickaxe.reductionPercent);
				boosts.push(`${pickaxe.reductionPercent}% for ${itemNameFromID(pickaxe.id)}`);
				break;
			}
		}
		if (skills.mining >= 60) {
			for (const glove of gloves) {
				if (user.hasEquipped(glove.id)) {
					timeToMine = reduceNumByPercent(timeToMine, glove.reductionPercent);
					boosts.push(`${glove.reductionPercent}% for ${itemNameFromID(glove.id)}`);
					break;
				}
			}
		}
		// Give gem rocks a speed increase for wearing a glory
		if (ore.id === 1625 && user.hasEquipped('Amulet of glory')) {
			timeToMine = Math.floor(timeToMine / 2);
			boosts.push('50% for having an Amulet of glory equipped');
		}

		const maxTripLength = calcMaxTripLength(user, 'Mining');

		// If no quantity provided, set it to the max.
		if (!quantity) {
			quantity = Math.floor(maxTripLength / timeToMine);
		}
		const duration = quantity * timeToMine;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
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

		let response = `${user.minionName} is now mining ${quantity}x ${ore.name}, it'll take around ${formatDuration(
			duration
		)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n **Boosts:** ${boosts.join(', ')}.`;
		}

		return response;
	}
};
