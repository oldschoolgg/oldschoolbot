import { reduceNumByPercent } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Activity, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { FishingTrawlerActivityTaskOptions } from '../../lib/types/minions';
import { calcWhatPercent, formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			aliases: ['trawler'],
			description:
				'Sends your minion to complete the fishing trawler, allowing you to get the angler outfit.',
			examples: ['+trawler'],
			categoryFlags: ['minion', 'skilling', 'minigame']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {
		if (msg.author.skillLevel(SkillsEnum.Fishing) < 15) {
			return msg.send(`You need atleast level 15 Fishing to do the Fishing Trawler.`);
		}

		const tripsDone = await msg.author.getMinigameScore('FishingTrawler');

		let tripLength = Time.Minute * 13;
		// 10% boost for 50 trips done
		const boost = Math.min(100, calcWhatPercent(tripsDone, 50)) / 10;
		tripLength = reduceNumByPercent(tripLength, boost);

		const quantity = Math.floor(msg.author.maxTripLength / tripLength);
		const duration = quantity * tripLength;

		await addSubTaskToActivityTask<FishingTrawlerActivityTaskOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			type: Activity.FishingTrawler,
			minigameID: 'FishingTrawler',
			quantity,
			duration
		});

		return msg.send(
			`${
				msg.author.minionName
			} is now doing ${quantity}x Fishing Trawler trips, it will take around ${formatDuration(
				duration
			)} to finish.\n\n**Boosts:** ${boost}% boost for experience`
		);
	}
}
