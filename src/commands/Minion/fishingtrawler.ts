import { calcWhatPercent, reduceNumByPercent, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { FishingTrawlerActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			aliases: ['trawler'],
			description: 'Sends your minion to complete the fishing trawler, allowing you to get the angler outfit.',
			examples: ['+trawler'],
			categoryFlags: ['minion', 'skilling', 'minigame']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {
		if (msg.author.skillLevel(SkillsEnum.Fishing) < 15) {
			return msg.channel.send('You need atleast level 15 Fishing to do the Fishing Trawler.');
		}

		const tripsDone = await msg.author.getMinigameScore('fishing_trawler');

		let tripLength = Time.Minute * 13;
		// 10% boost for 50 trips done
		const boost = Math.min(100, calcWhatPercent(tripsDone, 50)) / 10;
		tripLength = reduceNumByPercent(tripLength, boost);

		const quantity = Math.floor(msg.author.maxTripLength('FishingTrawler') / tripLength);
		const duration = quantity * tripLength;

		await addSubTaskToActivityTask<FishingTrawlerActivityTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			type: 'FishingTrawler',
			minigameID: 'fishing_trawler',
			quantity,
			duration
		});

		return msg.channel.send(
			`${
				msg.author.minionName
			} is now doing ${quantity}x Fishing Trawler trips, it will take around ${formatDuration(
				duration
			)} to finish.\n\n**Boosts:** ${boost}% boost for experience`
		);
	}
}
