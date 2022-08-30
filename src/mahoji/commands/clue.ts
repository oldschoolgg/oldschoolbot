import { randInt, Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { ClueTier, ClueTiers } from '../../lib/clues/clueTiers';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, isWeekend, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { OSBMahojiCommand } from '../lib/util';
import { getMahojiBank, mahojiUsersSettingsFetch, mUserFetch, userHasGracefulEquipped } from '../mahojiSettings';

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
		examples: ['/cl name:Boss']
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
		}
	],
	run: async ({ options, userID, channelID }: CommandRunOptions<{ tier: string }>) => {
		const user = await mUserFetch(userID);
		let quantity = 1;

		const clueTier = ClueTiers.find(tier => stringMatches(tier.name, options.tier));
		if (!clueTier) return 'Invalid clue tier.';

		const boosts = [];

		const [timeToFinish, percentReduced] = reducedClueTime(
			clueTier,
			(user.user.openable_scores as ItemBank)[clueTier.id] ?? 1
		);

		if (percentReduced >= 1) boosts.push(`${percentReduced}% for clue score`);

		let duration = timeToFinish * quantity;

		const maxTripLength = calcMaxTripLength(user, 'ClueCompletion');

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on Clue trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount you can do for ${clueTier.name} is ${Math.floor(
				maxTripLength / timeToFinish
			)}.`;
		}

		const cost = new Bank().add(clueTier.scrollID, quantity);
		if (!user.owns(cost)) return `You don't own ${cost}.`;
		await user.removeItemsFromBank(new Bank().add(clueTier.scrollID, quantity));

		const randomAddedDuration = randInt(1, 20);
		duration += (randomAddedDuration * duration) / 100;

		if (userHasGracefulEquipped(user)) {
			boosts.push('10% for Graceful');
			duration *= 0.9;
		}

		if (isWeekend()) {
			boosts.push('10% for Weekend');
			duration *= 0.9;
		}

		if (user.hasEquippedOrInBank('Achievement diary cape')) {
			boosts.push('10% for Achievement diary cape');
			duration *= 0.9;
		}

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
