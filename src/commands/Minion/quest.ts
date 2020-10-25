import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, MAX_QP, Tasks, Time } from '../../lib/constants';
import { hasGracefulEquipped } from '../../lib/gear/functions/hasGracefulEquipped';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { QuestingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			aliases: ['q']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		const currentQP = msg.author.settings.get(UserSettings.QP);
		if (currentQP >= MAX_QP) {
			return msg.send(`You already have the maximum amount of Quest Points.`);
		}

		const boosts = [];

		let duration = Time.Minute * 30;

		if (hasGracefulEquipped(msg.author.settings.get(UserSettings.Gear.Skilling))) {
			duration *= 0.9;
			boosts.push(`10% for Graceful`);
		}

		await addSubTaskToActivityTask<QuestingActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				type: Activity.Questing,
				duration,
				userID: msg.author.id,
				channelID: msg.channel.id
			}
		);
		let response = `${
			msg.author.minionName
		} is now completing quests, they'll come back in around ${formatDuration(duration)}.`;

		if (boosts.length > 0) {
			response += `\n\n **Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.send(response);
	}
}
