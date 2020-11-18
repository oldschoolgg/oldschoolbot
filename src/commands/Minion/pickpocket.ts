import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import Thieving from '../../lib/skilling/skills/thieving';
import { SkillsEnum } from '../../lib/skilling/types';
import { PickpocketActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' '
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const pickpocketable = Thieving.Pickpocketables.find(npc => stringMatches(npc.name, name));

		if (!pickpocketable) {
			return msg.send(
				`That is not a valid NPC to pickpocket, try pickpocketing one of the following: ${Thieving.Pickpocketables.map(
					npc => npc.name
				).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Thieving) < pickpocketable.level) {
			return msg.send(
				`${msg.author.minionName} needs ${pickpocketable.level} Thieving to pickpocket a ${pickpocketable.name}.`
			);
		}

		const timeToPickpocket = pickpocketable.ticksPerPick * 600;

		await msg.author.settings.sync(true);
		// If no quantity provided, set it to the max the player can make by either the items in bank or max time.
		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength / timeToPickpocket);
		}

		const duration = quantity * timeToPickpocket;

		if (duration > msg.author.maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount of times you can pickpocket a ${
					pickpocketable.name
				} is ${Math.floor(msg.author.maxTripLength / timeToPickpocket)}.`
			);
		}

		await addSubTaskToActivityTask<PickpocketActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				monsterID: pickpocketable.id,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.Pickpocket
			}
		);

		return msg.send(
			`${msg.author.minionName} is now going to pickpocket a ${
				pickpocketable.name
			} ${quantity}x times, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
