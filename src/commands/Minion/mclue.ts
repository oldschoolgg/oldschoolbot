import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks } from '../../lib/constants';
import { hasGracefulEquipped } from '../../lib/gear/functions/hasGracefulEquipped';
import ClueTiers from '../../lib/minions/data/clueTiers';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import reducedClueTime from '../../lib/minions/functions/reducedClueTime';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, isWeekend, rand, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

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

	invalidClue(msg: KlasaMessage): string {
		return `That isn't a valid clue tier, the valid tiers are: ${ClueTiers.map(
			tier => tier.name
		).join(', ')}. For example, \`${msg.cmdPrefix}minion clue 1 easy\``;
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, tierName]: [number | string, string]) {
		await msg.author.settings.sync(true);

		if (typeof quantity === 'string') {
			tierName = quantity;
			quantity = 1;
		}

		if (!tierName) return msg.send(this.invalidClue(msg));

		const clueTier = ClueTiers.find(tier => stringMatches(tier.name, tierName));

		if (!clueTier) return msg.send(this.invalidClue(msg));

		const boosts = [];

		let [timeToFinish, percentReduced] = reducedClueTime(
			clueTier,
			msg.author.settings.get(UserSettings.ClueScores)[clueTier.id] ?? 1
		);

		timeToFinish /= 2;

		if (percentReduced >= 1) boosts.push(`${percentReduced}% for clue score`);

		let duration = timeToFinish * quantity;

		if (duration > msg.author.maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on Clue trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount you can do for ${
					clueTier.name
				} is ${Math.floor(msg.author.maxTripLength / timeToFinish)}.`
			);
		}

		const bank = msg.author.settings.get(UserSettings.Bank);
		const numOfScrolls = bank[clueTier.scrollID];

		if (!numOfScrolls || numOfScrolls < quantity) {
			return msg.send(`You don't have ${quantity} ${clueTier.name} clue scrolls.`);
		}

		await msg.author.removeItemFromBank(clueTier.scrollID, quantity);

		const randomAddedDuration = rand(1, 20);
		duration += (randomAddedDuration * duration) / 100;

		if (hasGracefulEquipped(msg.author.settings.get(UserSettings.Gear.Skilling))) {
			boosts.push(`10% for Graceful`);
			duration *= 0.9;
		}

		if (isWeekend()) {
			boosts.push(`10% for Weekend`);
			duration *= 0.9;
		}

		boosts.push(`👻 2x Boost`);

		await addSubTaskToActivityTask<ClueActivityTaskOptions>(this.client, Tasks.ClueTicker, {
			clueID: clueTier.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.ClueCompletion
		});
		return msg.send(
			`${msg.author.minionName} is now completing ${quantity}x ${
				clueTier.name
			} clues, it'll take around ${formatDuration(duration)} to finish.${
				boosts.length > 0 ? `\n\n**Boosts:** ${boosts.join(', ')}` : ''
			}`
		);
	}
}
