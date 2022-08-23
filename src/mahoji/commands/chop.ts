import { reduceNumByPercent } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { Favours, gotFavour } from '../../lib/minions/data/kourendFavour';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import { SkillsEnum } from '../../lib/skilling/types';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import { determineScaledLogTime, formatDuration, itemNameFromID, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import itemID from '../../lib/util/itemID';
import { OSBMahojiCommand } from '../lib/util';
import { mUserFetch } from '../mahojiSettings';

const axes = [
	{
		id: itemID('Crystal axe'),
		reductionPercent: 12,
		wcLvl: 61
	},
	{
		id: itemID('Infernal axe'),
		reductionPercent: 9,
		wcLvl: 61
	},
	{
		id: itemID('Dragon axe'),
		reductionPercent: 9,
		wcLvl: 61
	}
];

export const chopCommand: OSBMahojiCommand = {
	name: 'chop',
	description: 'Chop logs using the Woodcutting skill.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/chop name:Logs']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The tree you want to chop.',
			required: true,
			autocomplete: async (value: string) => {
				return Woodcutting.Logs.filter(i =>
					!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
				).map(i => ({
					name: i.name,
					value: i.name
				}));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity of logs you want to chop (optional).',
			required: false,
			min_value: 1
		}
	],
	run: async ({
		options,
		userID,
		channelID
	}: CommandRunOptions<{ name: string; quantity?: number; alch?: boolean }>) => {
		const user = await mUserFetch(userID);
		const log = Woodcutting.Logs.find(
			log =>
				stringMatches(log.name, options.name) ||
				stringMatches(log.name.split(' ')[0], options.name) ||
				log.aliases?.some(a => stringMatches(a, options.name))
		);

		if (!log) return "That's not a valid log to chop.";

		if (user.skillLevel(SkillsEnum.Woodcutting) < log.level) {
			return `${user.minionName} needs ${log.level} Woodcutting to chop ${log.name}.`;
		}

		const { QP } = user;
		if (QP < log.qpRequired) {
			return `${user.minionName} needs ${log.qpRequired} QP to cut ${log.name}.`;
		}

		const [hasFavour, requiredPoints] = gotFavour(user, Favours.Hosidius, 75);
		if (!hasFavour && log.name === 'Redwood Logs') {
			return `${user.minionName} needs ${requiredPoints}% Hosidius Favour to chop Redwood at the Woodcutting Guild!`;
		}

		// Calculate the time it takes to chop a single log of this type, at this persons level.
		let timetoChop = determineScaledLogTime(log!.xp, log.respawnTime, user.skillLevel(SkillsEnum.Woodcutting));

		// If the user has an axe apply boost
		const boosts = [];
		for (const axe of axes) {
			if (user.hasEquippedOrInBank(axe.id) && user.skillLevel(SkillsEnum.Woodcutting) >= axe.wcLvl) {
				timetoChop = reduceNumByPercent(timetoChop, axe.reductionPercent);
				boosts.push(`${axe.reductionPercent}% for ${itemNameFromID(axe.id)}`);
				break;
			}
		}

		const maxTripLength = calcMaxTripLength(user, 'Woodcutting');

		let { quantity } = options;
		if (!quantity) quantity = Math.floor(maxTripLength / timetoChop);

		const duration = quantity * timetoChop;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${log.name} you can chop is ${Math.floor(
				maxTripLength / timetoChop
			)}.`;
		}

		await addSubTaskToActivityTask<WoodcuttingActivityTaskOptions>({
			logID: log.id,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'Woodcutting'
		});

		let response = `${user.minionName} is now chopping ${quantity}x ${log.name}, it'll take around ${formatDuration(
			duration
		)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return response;
	}
};
