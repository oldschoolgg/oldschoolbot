import { CommandStore, KlasaMessage } from 'klasa';
import { determineScaledLogTime, stringMatches, formatDuration, rand } from '../../lib/util';
import { BotCommand } from '../../lib/BotCommand';

import { SkillsEnum } from '../../lib/types';
import { Time, Activity, Tasks } from '../../lib/constants';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import Woodcutting from '../../lib/skills/woodcutting';
import itemID from '../../lib/util/itemID';
import { UserSettings } from '../../lib/UserSettings';
import bankHasItem from '../../lib/util/bankHasItem';

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
			throw `Thats not a valid log to mine. Valid ores are ${Woodcutting.Logs.map(
				log => log.name
			).join(', ')}.`;
		}

		if (msg.author.skillLevel(SkillsEnum.Woodcutting) < log.level) {
			throw `${msg.author.minionName} needs ${log.level} Woodcutting to chop ${log.name}.`;
		}

		// Calculate the time it takes to mine a single log of this type, at this persons level.
		let timetoChop = determineScaledLogTime(
			log!.xp,
			log.respawnTime,
			msg.author.skillLevel(SkillsEnum.Woodcutting)
		);

		// If the user has a dragon axe & over 61 mining provide 10% speed boost
		const bank = msg.author.settings.get(UserSettings.Bank);
		if (msg.author.skillLevel(SkillsEnum.Woodcutting) >= 61) {
			if (bankHasItem(bank, itemID('Infernal axe'))) {
				timetoChop = Math.floor(timetoChop * 0.86);
			} else if (bankHasItem(bank, itemID('Dragon axe'))) {
				timetoChop = Math.floor(timetoChop * 0.9);
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
		return msg.send(
			`${msg.author.minionName} is now Woodcutting ${quantity}x ${
				log.name
			}, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
