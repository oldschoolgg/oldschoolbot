import { CommandStore, KlasaMessage } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { formatDuration, rand } from '../../lib/util';
import { Time, Activity, Tasks } from '../../lib/constants';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { QuestingActivityTaskOptions } from '../../lib/types/minions';
import { UserSettings } from '../../lib/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1
		});
	}

	async run(msg: KlasaMessage) {
		if (!msg.author.hasMinion) {
			throw `You dont have a minion`;
		}
		const CurrentQP = msg.author.settings.get(UserSettings.QP);
		if (CurrentQP >= 275) {
			throw `You already have the maximum amount of Quest Points`;
		}

		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}

		const duration = Time.Minute * 30;

		const data: QuestingActivityTaskOptions = {
			type: Activity.Questing,
			id: rand(1, 10_000_000),
			duration,
			userID: msg.author.id,
			channelID: msg.channel.id,
			finishDate: Date.now() + duration
		};

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
		msg.author.incrementMinionDailyDuration(duration);
		return msg.send(
			`${msg.author.minionName} is now questing, it'll take around ${formatDuration(
				duration
			)} to finish.`
		);
	}
}
