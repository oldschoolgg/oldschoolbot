import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { Activity, Emoji, Time } from '../../lib/constants';
import { hasGracefulEquipped } from '../../lib/gear/functions/hasGracefulEquipped';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { TitheFarmActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true
		});
	}

	determineDuration(user: KlasaUser): [number, string[]] {
		let baseTime = Time.Second * 1500;
		let nonGracefulTimeAddition = Time.Second * 123;

		const boostStr = [];

		// Reduce time based on tithe farm completions
		const titheFarmsCompleted = user.settings.get(UserSettings.Stats.TitheFarmsCompleted);
		const percentIncreaseFromCompletions =
			Math.floor(Math.min(50, titheFarmsCompleted) / 2) / 100;
		baseTime = Math.floor(baseTime * (1 - percentIncreaseFromCompletions));
		Math.floor(percentIncreaseFromCompletions * 100) > 0
			? boostStr.push(
					`${Math.floor(
						percentIncreaseFromCompletions * 100
					)}% from Tithe Farms completed`
			  )
			: boostStr.push('');

		// Reduce time if user has graceful equipped
		if (hasGracefulEquipped(user.settings.get(UserSettings.Gear.Skilling))) {
			nonGracefulTimeAddition = 0;
			boostStr.push('10% from graceful outfit');
		}

		const totalTime = baseTime + nonGracefulTimeAddition;

		return [totalTime, boostStr];
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
		const titheFarmPoints = msg.author.settings.get(UserSettings.Stats.TitheFarmPoints);

		if (msg.flagArgs.points) {
			return msg.send(`You have ${titheFarmPoints} Tithe Farm points.`);
		}

		if (msg.author.skillLevel(SkillsEnum.Farming) < 34) {
			throw `${msg.author.minionName} needs 34 Farming to use the Tithe Farm!`;
		}

		const [duration, boostStr] = this.determineDuration(msg.author);

		await addSubTaskToActivityTask<TitheFarmActivityTaskOptions>(this.client, {
			minigameID: 'TitheFarm',
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity: 1,
			duration,
			type: Activity.TitheFarm
		});

		return msg.send(
			`Your minion is off completing a round of the ${
				Emoji.MinigameIcon
			} Tithe Farm. It'll take ${formatDuration(duration)} to finish.\n\n${
				boostStr.length > 0 ? `**Boosts:** ` : ``
			}${boostStr.join(', ')}`
		);
	}
}
