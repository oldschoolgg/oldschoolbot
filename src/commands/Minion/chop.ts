import { CommandStore, KlasaMessage } from 'klasa';

import {
	determineScaledLogTime,
	stringMatches,
	formatDuration,
	rand,
	itemNameFromID
} from '../../lib/util';
import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks } from '../../lib/constants';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import itemID from '../../lib/util/itemID';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';

const axes = [
	{
		id: itemID('3rd age axe'),
		reductionPercent: 13
	},
	{
		id: itemID('Gilded axe'),
		reductionPercent: 12
	},
	{
		id: itemID('Infernal axe'),
		reductionPercent: 11
	},
	{
		id: itemID('Dragon axe'),
		reductionPercent: 9
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (!msg.author.hasMinion) {
			throw `You dont have a minion`;
		}

		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}

		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const log = Woodcutting.Logs.find(
			log => stringMatches(log.name, name) || stringMatches(log.name.split(' ')[0], name)
		);

		if (!log) {
			throw `That's not a valid log to chop. Valid logs are ${Woodcutting.Logs.map(
				log => log.name
			).join(', ')}.`;
		}

		if (msg.author.skillLevel(SkillsEnum.Woodcutting) < log.level) {
			throw `${msg.author.minionName} needs ${log.level} Woodcutting to chop ${log.name}.`;
		}

		const QP = msg.author.settings.get(UserSettings.QP);
		if (QP < log.qpRequired) {
			throw `${msg.author.minionName} needs ${log.qpRequired} QP to cut ${log.name}.`;
		}

		// Calculate the time it takes to chop a single log of this type, at this persons level.
		let timetoChop = determineScaledLogTime(
			log!.xp,
			log.respawnTime,
			msg.author.skillLevel(SkillsEnum.Woodcutting)
		);

		// If the user has an axe apply boost
		const boosts = [];
		if (msg.author.skillLevel(SkillsEnum.Woodcutting) >= 61) {
			for (const axe of axes) {
				if (msg.author.hasItemEquippedOrInBank(axe.id)) {
					timetoChop = Math.floor(timetoChop * ((100 - axe.reductionPercent) / 100));
					boosts.push(`${axe.reductionPercent}% for ${itemNameFromID(axe.id)}`);
					break;
				}
			}
		}

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / timetoChop);
		}

		const duration = quantity * timetoChop;

		if (duration > msg.author.maxTripLength) {
			throw `${msg.author.minionName} can't go on trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower quantity. The highest amount of ${
				log.name
			} you can chop is ${Math.floor(msg.author.maxTripLength / timetoChop)}.`;
		}

		const data: WoodcuttingActivityTaskOptions = {
			logID: log.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Woodcutting,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);

		let response = `${msg.author.minionName} is now chopping ${quantity}x ${
			log.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n **Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.send(response);
	}
}
