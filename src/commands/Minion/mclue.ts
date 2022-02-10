import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import ClueTiers from '../../lib/minions/data/clueTiers';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClueTier } from '../../lib/minions/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, isWeekend, rand, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

function reducedClueTime(clueTier: ClueTier, score: number) {
	// Every 3 hours become 1% better to a cap of 10%
	const percentReduced = Math.min(Math.floor(score / ((Time.Hour * 3) / clueTier.timeToFinish)), 10);
	const amountReduced = (clueTier.timeToFinish * percentReduced) / 100;
	const reducedTime = clueTier.timeToFinish - amountReduced;

	return [reducedTime, percentReduced];
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' ',
			categoryFlags: ['minion', 'minigame'],
			description: 'Sends your minion to complete a clue scroll.',
			examples: ['+mclue easy']
		});
	}

	invalidClue(msg: KlasaMessage): string {
		return `That isn't a valid clue tier, the valid tiers are: ${ClueTiers.map(tier => tier.name).join(
			', '
		)}. For example, \`${msg.cmdPrefix}minion clue 1 easy\``;
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, tierName]: [number | string, string]) {
		await msg.author.settings.sync(true);

		if (typeof quantity === 'string') {
			tierName = quantity;
			quantity = 1;
		}

		if (!tierName) return msg.channel.send(this.invalidClue(msg));

		const clueTier = ClueTiers.find(tier => stringMatches(tier.name, tierName));

		if (!clueTier) return msg.channel.send(this.invalidClue(msg));

		const boosts = [];

		const [timeToFinish, percentReduced] = reducedClueTime(
			clueTier,
			msg.author.settings.get(UserSettings.ClueScores)[clueTier.id] ?? 1
		);

		if (percentReduced >= 1) boosts.push(`${percentReduced}% for clue score`);

		let duration = timeToFinish * quantity;

		const maxTripLength = msg.author.maxTripLength('ClueCompletion');

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on Clue trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount you can do for ${clueTier.name} is ${Math.floor(
					maxTripLength / timeToFinish
				)}.`
			);
		}

		const bank = msg.author.settings.get(UserSettings.Bank);
		const numOfScrolls = bank[clueTier.scrollID];

		if (!numOfScrolls || numOfScrolls < quantity) {
			return msg.channel.send(`You don't have ${quantity} ${clueTier.name} clue scrolls.`);
		}

		await msg.author.removeItemsFromBank(new Bank().add(clueTier.scrollID, quantity));

		const randomAddedDuration = rand(1, 20);
		duration += (randomAddedDuration * duration) / 100;

		if (msg.author.hasGracefulEquipped()) {
			boosts.push('10% for Graceful');
			duration *= 0.9;
		}

		if (isWeekend()) {
			boosts.push('10% for Weekend');
			duration *= 0.9;
		}

		if (msg.author.hasItemEquippedAnywhere(['Achievement diary cape', 'Achievement diary cape(t)'], false)) {
			boosts.push('10% for Achievement diary cape');
			duration *= 0.9;
		}

		await addSubTaskToActivityTask<ClueActivityTaskOptions>({
			clueID: clueTier.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: 'ClueCompletion'
		});
		return msg.channel.send(
			`${msg.author.minionName} is now completing ${quantity}x ${
				clueTier.name
			} clues, it'll take around ${formatDuration(duration)} to finish.${
				boosts.length > 0 ? `\n\n**Boosts:** ${boosts.join(', ')}` : ''
			}`
		);
	}
}
