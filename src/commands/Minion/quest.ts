import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Activity, MAX_QP } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { QuestingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			aliases: ['q'],
			categoryFlags: ['minion'],
			description: 'Sends your minion to complete quests.',
			examples: ['+q']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		const currentQP = msg.author.settings.get(UserSettings.QP);
		if (currentQP >= MAX_QP && !msg.author.isIronman) {
			return msg.channel.send('You already have the maximum amount of Quest Points.');
		}

		const boosts = [];

		let duration = Time.Minute * 30;

		// Reduce time if user has graceful/globetrotter equipped
		if (msg.author.hasGlobetrotterEquipped()) {
			boosts.push('20% for having the Globetrotter Outfit');
			duration *= 0.8;
		} else if (msg.author.hasGracefulEquipped()) {
			duration *= 0.9;
			boosts.push('10% for Graceful');
		}

		await addSubTaskToActivityTask<QuestingActivityTaskOptions>({
			type: Activity.Questing,
			duration,
			userID: msg.author.id,
			channelID: msg.channel.id
		});
		let response = `${msg.author.minionName} is now completing quests, they'll come back in around ${formatDuration(
			duration
		)}.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.channel.send(response);
	}
}
