import { CommandStore, KlasaMessage } from 'klasa';

import {
	determineScaledLogTime,
	stringMatches,
	formatDuration,
	rand,
	itemNameFromID
} from '../../lib/util';
import { BotCommand } from '../../lib/BotCommand';
import { SkillsEnum } from '../../lib/types';
import { Time, Activity, Tasks } from '../../lib/constants';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import Woodcutting from '../../lib/skills/woodcutting';
import itemID from '../../lib/util/itemID';
import { UserSettings } from '../../lib/UserSettings';
import bankHasItem from '../../lib/util/bankHasItem';

const axes = [
	{
		id: itemID('3rd age axe'),
		reductionPercent: 11
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

		// Calculate the time it takes to chop a single log of this type, at this persons level.
		let timetoChop = determineScaledLogTime(
			log!.xp,
			log.respawnTime,
			msg.author.skillLevel(SkillsEnum.Woodcutting)
		);

		// If the user has an axe apply boost
		const bank = msg.author.settings.get(UserSettings.Bank);
		const boosts = [];
		if (msg.author.skillLevel(SkillsEnum.Woodcutting) >= 61) {
			for (const axe of axes) {
				if (bankHasItem(bank, axe.id)) {
					timetoChop = Math.floor(timetoChop * ((100 - axe.reductionPercent) / 100));
					boosts.push(`${axe.reductionPercent}% for ${itemNameFromID(axe.id)}`);
					break;
				}
			}
		}

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor((Time.Minute * 30) / timetoChop);
		}

		const duration = quantity * timetoChop;

		if (duration > Time.Minute * 30) {
			throw `${
				msg.author.minionName
			} can't go on trips longer than 30 minutes, try a lower quantity. The highest amount of ${
				log.name
			} you can chop is ${Math.floor((Time.Minute * 30) / timetoChop)}.`;
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
		msg.author.incrementMinionDailyDuration(duration);
		let response = `${msg.author.minionName} is now chopping ${quantity}x ${
			log.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n **Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.send(response);
	}
}
