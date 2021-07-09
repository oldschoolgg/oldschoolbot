import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import {
	determineScaledLogTime,
	formatDuration,
	itemNameFromID,
	reduceNumByPercent,
	stringMatches
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';

const axes = [
	{
		id: itemID('3rd age axe'),
		reductionPercent: 12,
		wcLvl: 61
	},
	{
		id: itemID('Crystal axe'),
		reductionPercent: 12,
		wcLvl: 61
	},
	{
		id: itemID('Gilded axe'),
		reductionPercent: 12,
		wcLvl: 41
	},
	{
		id: itemID('Infernal axe'),
		reductionPercent: 11,
		wcLvl: 61
	},
	{
		id: itemID('Dragon axe'),
		reductionPercent: 9,
		wcLvl: 61
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' ',
			description: 'Sends your minion to chop logs.',
			examples: ['+chop 100 logs', '+chop magic logs'],
			categoryFlags: ['skilling', 'minion']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const log = Woodcutting.Logs.find(
			log => stringMatches(log.name, name) || stringMatches(log.name.split(' ')[0], name)
		);

		if (!log) {
			return msg.channel.send(
				`That's not a valid log to chop. Valid logs are ${Woodcutting.Logs.map(log => log.name).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Woodcutting) < log.level) {
			return msg.channel.send(`${msg.author.minionName} needs ${log.level} Woodcutting to chop ${log.name}.`);
		}

		const QP = msg.author.settings.get(UserSettings.QP);
		if (QP < log.qpRequired) {
			return msg.channel.send(`${msg.author.minionName} needs ${log.qpRequired} QP to cut ${log.name}.`);
		}

		// Calculate the time it takes to chop a single log of this type, at this persons level.
		let timetoChop = determineScaledLogTime(
			log!.xp,
			log.respawnTime,
			msg.author.skillLevel(SkillsEnum.Woodcutting)
		);

		// If the user has an axe apply boost
		const boosts = [];
		for (const axe of axes) {
			if (
				msg.author.hasItemEquippedOrInBank(axe.id) &&
				msg.author.skillLevel(SkillsEnum.Woodcutting) >= axe.wcLvl
			) {
				timetoChop = reduceNumByPercent(timetoChop, axe.reductionPercent);
				boosts.push(`${axe.reductionPercent}% for ${itemNameFromID(axe.id)}`);
				break;
			}
		}

		const maxTripLength = msg.author.maxTripLength(Activity.Woodcutting);

		const quantitySpecified = quantity !== null;
		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timetoChop);
		}

		const duration = quantity * timetoChop;

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${log.name} you can chop is ${Math.floor(
					maxTripLength / timetoChop
				)}.`
			);
		}

		await addSubTaskToActivityTask<WoodcuttingActivityTaskOptions>({
			logID: log.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Woodcutting,
			quantitySpecified
		});

		let response = `${msg.author.minionName} is now chopping ${quantity}x ${
			log.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.channel.send(response);
	}
}
