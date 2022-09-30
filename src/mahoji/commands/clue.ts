import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { ClueTier, ClueTiers } from '../../lib/clues/clueTiers';
import { clueHunterOutfit } from '../../lib/data/CollectionsExport';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { clamp, formatDuration, isWeekend, randomVariation, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { OSBMahojiCommand } from '../lib/util';
import { getMahojiBank, mahojiUsersSettingsFetch, userHasGracefulEquipped } from '../mahojiSettings';

function reducedClueTime(clueTier: ClueTier, score: number) {
	// Every 3 hours become 1% better to a cap of 10%
	const percentReduced = Math.min(Math.floor(score / ((Time.Hour * 3) / clueTier.timeToFinish)), 10);
	const amountReduced = (clueTier.timeToFinish * percentReduced) / 100;
	const reducedTime = clueTier.timeToFinish - amountReduced;

	return [reducedTime, percentReduced];
}

export const clueCommand: OSBMahojiCommand = {
	name: 'clue',
	description: 'Send your minion to complete clue scrolls.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/clue tier:easy']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'tier',
			description: 'The clue you want to do.',
			required: true,
			autocomplete: async (_, user) => {
				const bank = getMahojiBank(await mahojiUsersSettingsFetch(user.id, { bank: true }));
				return ClueTiers.map(i => ({ name: `${i.name} (${bank.amount(i.scrollID)}x Owned)`, value: i.name }));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to do.',
			required: false,
			min_value: 1
		}
	],
	run: async ({ options, userID, channelID }: CommandRunOptions<{ tier: string; quantity?: number }>) => {
		const user = await mUserFetch(userID);
		const clueScores = user.openableScores();

		const clueTier = ClueTiers.find(
			tier => stringMatches(tier.id.toString(), options.tier) || stringMatches(tier.name, options.tier)
		);
		if (!clueTier) return 'Invalid clue tier.';

		if (clueTier.name === 'Grandmaster' && (!clueScores[19_836] || clueScores[19_836] < 100)) {
			return "You aren't experienced enough to complete a Grandmaster clue.";
		}

		const maxTripLength = calcMaxTripLength(user, 'ClueCompletion');

		const boosts = [];

		let [timeToFinish, percentReduced] = reducedClueTime(
			clueTier,
			(user.user.openable_scores as ItemBank)[clueTier.id] ?? 1
		);

		timeToFinish /= 2;
		boosts.push('👻 2x Boost');

		if (user.hasEquipped(clueHunterOutfit, true)) {
			timeToFinish /= 2;
			boosts.push('2x Boost for Clue hunter outfit');
		}

		if (userHasGracefulEquipped(user)) {
			boosts.push('10% for Graceful');
			timeToFinish *= 0.9;
		}

		if (isWeekend()) {
			boosts.push('10% for Weekend');
			timeToFinish *= 0.9;
		}

		if (user.hasEquippedOrInBank('Achievement diary cape')) {
			boosts.push('10% for Achievement diary cape');
			timeToFinish *= 0.9;
		}

		if (percentReduced >= 1) boosts.push(`${percentReduced}% for clue score`);

		let { quantity } = options;
		const maxPerTrip = Math.floor(maxTripLength / timeToFinish);

		if (!quantity) {
			quantity = maxPerTrip;
		}
		quantity = clamp(quantity, 1, user.bank.amount(clueTier.scrollID));

		let duration = timeToFinish * quantity;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on Clue trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount you can do for ${clueTier.name} is ${Math.floor(
				maxTripLength / timeToFinish
			)}.`;
		}

		const { bank } = user;
		const numOfScrolls = bank.amount(clueTier.scrollID);

		if (!numOfScrolls || numOfScrolls < quantity) {
			return `You don't have ${quantity} ${clueTier.name} clue scrolls.`;
		}

		await user.removeItemsFromBank(new Bank().add(clueTier.scrollID, quantity));

		duration = Math.floor(randomVariation(duration, 5));

		await addSubTaskToActivityTask<ClueActivityTaskOptions>({
			clueID: clueTier.id,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'ClueCompletion'
		});
		return `${user.minionName} is now completing ${quantity}x ${
			clueTier.name
		} clues, it'll take around ${formatDuration(duration)} to finish.${
			boosts.length > 0 ? `\n\n**Boosts:** ${boosts.join(', ')}` : ''
		}`;
	}
};
