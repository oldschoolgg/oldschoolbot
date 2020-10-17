import { reduceNumByPercent } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { FishingTrawlerActivityTaskOptions } from '../../lib/types/minions';
import { calcWhatPercent, formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			aliases: ['trawler']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {
		const tripsDone = msg.author.getMinigameScore(MinigameIDsEnum.FishingTrawler);

		let tripLength = Time.Minute * 13;
		// 10% boost for 50 trips done
		const boost = Math.min(100, calcWhatPercent(tripsDone, 50)) / 10;
		tripLength = reduceNumByPercent(tripLength, boost);

		const quantity = Math.floor(msg.author.maxTripLength / tripLength);
		const duration = quantity * tripLength;

		await addSubTaskToActivityTask<FishingTrawlerActivityTaskOptions>(
			this.client,
			Tasks.MinigameTicker,
			{
				userID: msg.author.id,
				channelID: msg.channel.id,
				type: Activity.FishingTrawler,
				minigameID: MinigameIDsEnum.FishingTrawler,
				quantity,
				duration
			}
		);

		return msg.send(
			`${
				msg.author.minionName
			} is now doing ${quantity}x Fishing Trawler trips, it will take around ${formatDuration(
				duration
			)} to finish.\n\n**Boosts:** ${boost}% boost for experience`
		);
	}
}
