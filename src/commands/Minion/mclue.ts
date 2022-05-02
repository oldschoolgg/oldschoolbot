import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { clueHunterOutfit } from '../../lib/data/CollectionsExport';
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
			quantity = -1;
		}

		if (!tierName) return msg.channel.send(this.invalidClue(msg));

		const clueTier = ClueTiers.find(tier => tier.aliases.some(alias => stringMatches(alias, tierName)));

		if (!clueTier) return msg.channel.send(this.invalidClue(msg));

		const boosts = [];

		if (
			clueTier.name === 'Grandmaster' &&
			(msg.author.settings.get(UserSettings.ClueScores)[19_836] === undefined ||
				msg.author.settings.get(UserSettings.ClueScores)[19_836] < 100)
		) {
			return msg.channel.send("You aren't experienced enough to complete a Grandmaster clue.");
		}

		let [timeToFinish, percentReduced] = reducedClueTime(
			clueTier,
			msg.author.settings.get(UserSettings.ClueScores)[clueTier.id] ?? 1
		);

		timeToFinish /= 2;
		boosts.push('👻 2x Boost');

		if (percentReduced >= 1) boosts.push(`${percentReduced}% for clue score`);

		if (msg.author.hasItemEquippedAnywhere(clueHunterOutfit, true)) {
			timeToFinish /= 2;
			boosts.push('2x Boost for Clue hunter outfit');
		}

		if (msg.author.hasGracefulEquipped()) {
			boosts.push('10% for Graceful');
			timeToFinish *= 0.9;
		}

		if (msg.author.hasItemEquippedOrInBank('Achievement diary cape')) {
			boosts.push('10% for Achievement diary cape');
			timeToFinish *= 0.9;
		}

		const bank = msg.author.bank();
		const numOfScrolls = bank.amount(clueTier.scrollID);

		const maxTripLength = msg.author.maxTripLength('ClueCompletion');
		const maxPerTrip = Math.floor(maxTripLength / timeToFinish);
		if (quantity === -1) quantity = maxPerTrip;

		if (!numOfScrolls || numOfScrolls < quantity) {
			return msg.channel.send(`You don't have ${quantity} ${clueTier.name} clue scrolls.`);
		}

		let qtyWarning = '';
		if (numOfScrolls < quantity) {
			qtyWarning = `You can't do ${quantity} because you only have ${numOfScrolls}x ${clueTier.name.toLowerCase()} clue scrolls.`;
			quantity = numOfScrolls;
		}

		let duration = timeToFinish * quantity;

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on Clue trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount you can do for ${clueTier.name.toLowerCase()} is ${Math.floor(
					maxTripLength / timeToFinish
				)}.`
			);
		}

		await msg.author.removeItemsFromBank(new Bank().add(clueTier.scrollID, quantity));

		if (isWeekend()) {
			boosts.push('10% for Weekend');
			duration *= 0.9;
		}

		const randomAddedDuration = rand(1, 20);
		duration += (randomAddedDuration * duration) / 100;

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
			} clues, it'll take around ${formatDuration(duration)} to finish. ${qtyWarning}${
				boosts.length > 0 ? `\n\n**Boosts:** ${boosts.join(', ')}` : ''
			}`
		);
	}
}
