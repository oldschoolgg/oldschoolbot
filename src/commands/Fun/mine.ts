import { KlasaClient, CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { determineScaledOreTime, stringMatches, formatDuration } from '../../lib/util';
import Mining from '../../lib/skills/mining';
import { SkillsEnum, MiningActivityTaskOptions } from '../../lib/types';
import { Time, Activity, Tasks } from '../../lib/constants';

export default class extends BotCommand {
	public constructor(
		client: KlasaClient,
		store: CommandStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int|name:...string> [name:...string]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [quantity, name]: [null | number | string, string]) {
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

		const ore = Mining.Ores.find(
			ore => stringMatches(ore.name, name) || stringMatches(ore.name.split(' ')[0], name)
		);

		if (!ore) {
			throw `Thats not a valid ore to mine. Valid ores are ${Mining.Ores.map(
				ore => ore.name
			).join(', ')}.`;
		}

		if (msg.author.skillLevel(SkillsEnum.Mining) < ore.level) {
			throw `${msg.author.minionName} needs ${ore.level} Mining to mine ${ore.name}.`;
		}

		// Calculate the time it takes to mine a single ore of this type, at this persons level.
		const timeToMine = determineScaledOreTime(
			ore!.xp,
			ore.respawnTime,
			msg.author.skillLevel(SkillsEnum.Mining)
		);

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor((Time.Minute * 30) / timeToMine);
		}

		const duration = quantity * timeToMine;

		if (duration > Time.Minute * 30) {
			throw `${
				msg.author.minionName
			} can't go on trips longer than 30 minutes, try a lower quantity. The highest amount of ${
				ore.name
			} you can mine is ${(Time.Minute * 30) / timeToMine}.`;
		}

		const data: MiningActivityTaskOptions = {
			oreID: ore.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Mining
		};

		this.client.schedule.create(Tasks.MiningActivity, Date.now() + duration, {
			data,
			catchUp: true
		});

		return msg.send(
			`${msg.author.minionName} is now mining ${quantity}x ${
				ore.name
			}, it'll take around ${formatDuration(duration)} to finish.`
		);

		//return msg.send(`Mining ${quantity} of ${ore.name}`);
	}
}
