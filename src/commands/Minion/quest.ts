import { CommandStore, KlasaMessage } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { formatDuration, rand } from '../../lib/util';
import { Time, Activity, Tasks, MAX_QP, Events } from '../../lib/constants';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { QuestingActivityTaskOptions } from '../../lib/types/minions';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import hasGracefulEquipped from '../../lib/gear/functions/hasGracefulEquipped';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			aliases: ['q']
		});
	}

	async run(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw `You dont have a minion.`;
		}

		const currentQP = msg.author.settings.get(UserSettings.QP);
		if (currentQP >= MAX_QP) {
			throw `You already have the maximum amount of Quest Points.`;
		}

		if (msg.author.minionIsBusy) {
			this.client.emit(
				Events.Log,
				`${msg.author.username}[${msg.author.id}] [TTK-BUSY] Questing`
			);

			return msg.send(msg.author.minionStatus);
		}

		const boosts = [];

		let duration = Time.Minute * 30;

		if (hasGracefulEquipped(msg.author.settings.get(UserSettings.Gear.Skilling))) {
			duration *= 0.9;
			boosts.push(`10% for Graceful`);
		}

		const data: QuestingActivityTaskOptions = {
			type: Activity.Questing,
			id: rand(1, 10_000_000),
			duration,
			userID: msg.author.id,
			channelID: msg.channel.id,
			finishDate: Date.now() + duration
		};

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
		let response = `${
			msg.author.minionName
		} is now completing quests, they'll come back in around ${formatDuration(duration)}.`;

		if (boosts.length > 0) {
			response += `\n\n **Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.send(response);
	}
}
