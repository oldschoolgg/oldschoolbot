import { CommandStore, KlasaMessage } from 'klasa';

import {
	determineScaledCreatureTime,
	stringMatches,
	formatDuration,
	rand,
	itemNameFromID
} from '../../lib/util';
import { BotCommand } from '../../lib/BotCommand';
import { SkillsEnum } from '../../lib/types';
import { Time, Activity, Tasks } from '../../lib/constants';
import { HunterActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import Hunter from '../../lib/skills/hunter';
import itemID from '../../lib/util/itemID';
import { UserSettings } from '../../lib/UserSettings';
import bankHasItem from '../../lib/util/bankHasItem';

const supplies = [
	{
		id: itemID('Bird Snare'),
		reductionPercent: 1
	},
	{
		id: itemID('Box trap'),
		reductionPercent: 1
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

		const creature = Hunter.Creatures.find(
			creature =>
				stringMatches(creature.name, name) ||
				stringMatches(creature.name.split(' ')[0], name)
		);

		if (!creature) {
			throw `That's not a valid creature to hunt. Valid creatures are ${Hunter.Creatures.map(
				creature => creature.name
			).join(', ')}.`;
		}

		if (msg.author.skillLevel(SkillsEnum.Hunter) < creature.level) {
			throw `${msg.author.minionName} needs ${creature.level} Hunter to hunt ${creature.name}.`;
		}

		// Calculate the time it takes to hunt a single creature of this type, at this persons level.
		let timetoHunt = determineScaledCreatureTime(
			creature!.xp,
			creature.respawnTime,
			msg.author.skillLevel(SkillsEnum.Hunter)
		);

		// If the user has supplies, apply boost
		const bank = msg.author.settings.get(UserSettings.Bank);
		const boosts = [];
		if (msg.author.skillLevel(SkillsEnum.Hunter) >= 61) {
			for (const supply of supplies) {
				if (bankHasItem(bank, supply.id)) {
					timetoHunt = Math.floor(timetoHunt * ((100 - supply.reductionPercent) / 100));
					boosts.push(`${supply.reductionPercent}% for ${itemNameFromID(supply.id)}`);
					break;
				}
			}
		}

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor((Time.Minute * 30) / timetoHunt);
		}

		const duration = quantity * timetoHunt;

		if (duration > Time.Minute * 30) {
			throw `${
				msg.author.minionName
			} can't go on trips longer than 30 minutes, try a lower quantity. The highest amount of ${
				creature.name
			} you can hunt is ${Math.floor((Time.Minute * 30) / timetoHunt)}.`;
		}

		const data: HunterActivityTaskOptions = {
			creatureID: creature.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Hunter,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
		msg.author.incrementMinionDailyDuration(duration);
		let response = `${msg.author.minionName} is now hunting ${quantity}x ${
			creature.name
		}, it'll take around ${formatDuration(duration)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n **Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.send(response);
	}
}
