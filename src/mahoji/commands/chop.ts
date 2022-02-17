import { reduceNumByPercent } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { Favours, gotFavour } from '../../lib/minions/data/kourendFavour';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import { SkillsEnum } from '../../lib/skilling/types';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import { determineScaledLogTime, formatDuration, itemNameFromID, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';
import { OSBMahojiCommand } from '../lib/util';

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
	description: 'Sends your minion to chop logs.',
	attributes: {
		categoryFlags: ['minion', 'skilling'],
		description: 'Sends your minion to chop logs.'
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The name of the tree you wish to chop',
			required: true,
			autocomplete: async (value: string) => {
				return Woodcutting.Logs.filter(i =>
					!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
				).map(i => ({ name: i.name, value: i.name }));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The amount of logs you want to chop.',
			required: false,
			min_value: 1,
			max_value: 2000
		}
	],
	run: async ({
		channelID,
		options,
		userID
	}: CommandRunOptions<{
		name: string;
		quantity?: number;
	}>) => {
		const user = await client.fetchUser(userID.toString());
		let { name, quantity } = options;

		const logOpt = Woodcutting.Logs.find(_chop => stringMatches(_chop.name, name));

		if (!logOpt) {
			return `That's not a valid log to chop. Valid logs are ${Woodcutting.Logs.map(log => log.name).join(
				', '
			)}.`;
		}

		if (user.skillLevel(SkillsEnum.Woodcutting) < logOpt.level) {
			return `${user.minionName} needs ${logOpt.level} Woodcutting to chop ${logOpt.name}`;
		}

		const QP = user.settings.get(UserSettings.QP);
		if (QP < logOpt.qpRequired) {
			return `You need atleast ${logOpt.qpRequired} Quest Points to chop ${logOpt.name}.`;
		}

		const [hasFavour, requiredPoints] = gotFavour(user, Favours.Hosidius, 75);
		if (!hasFavour && logOpt.name === 'Redwood Logs') {
			return `${user.minionName} needs ${requiredPoints}% Hosidius Favour to chop Redwood at the Woodcutting Guild!`;
		}

		// Calculate the time it takes to chop a single log of this type, at this persons level.
		let timetoChop = determineScaledLogTime(
			logOpt!.xp,
			logOpt.respawnTime,
			user.skillLevel(SkillsEnum.Woodcutting)
		);

		// If the user has an axe apply boost
		const boosts = [];
		for (const axe of axes) {
			if (user.hasItemEquippedOrInBank(axe.id) && user.skillLevel(SkillsEnum.Woodcutting) >= axe.wcLvl) {
				timetoChop = reduceNumByPercent(timetoChop, axe.reductionPercent);
				boosts.push(`${axe.reductionPercent}% for ${itemNameFromID(axe.id)}`);
				break;
			}
		}

		const maxTripLength = user.maxTripLength('Woodcutting');

		// If no quantity provided, set it to the max.
		if (!quantity) {
			quantity = Math.floor(maxTripLength / timetoChop);
		}

		const duration = quantity * timetoChop;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${logOpt.name} you can chop is ${Math.floor(
				maxTripLength / timetoChop
			)}.`;
		}

		await addSubTaskToActivityTask<WoodcuttingActivityTaskOptions>({
			logID: logOpt.id,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'Woodcutting'
		});

		let response = `${user.minionName} is now chopping ${quantity}x ${
			logOpt.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return response;
	}
};
