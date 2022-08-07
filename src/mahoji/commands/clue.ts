import { User } from '@prisma/client';
import { randInt, Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { verifyClueStatusesForUser } from '../../lib/clues/clueReqs';
import { ClueTier, ClueTiers } from '../../lib/clues/clueTiers';
import { hasGracefulEquippedAnywhere } from '../../lib/gear';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, isWeekend, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { hasItemsEquippedOrInBank } from '../../lib/util/minionUtils';
import { OSBMahojiCommand } from '../lib/util';
import { getMahojiBank, mahojiUsersSettingsFetch } from '../mahojiSettings';

function reducedClueTime(clueTier: ClueTier, score: number) {
	// Every 3 hours become 1% better to a cap of 10%
	const percentReduced = Math.min(Math.floor(score / ((Time.Hour * 3) / clueTier.timeToFinish)), 10);
	const amountReduced = (clueTier.timeToFinish * percentReduced) / 100;
	const reducedTime = clueTier.timeToFinish - amountReduced;

	return [reducedTime, percentReduced];
}

interface ClueBoost {
	description: string;
	has: (user: User) => boolean;
	change: (duration: number) => number;
}
const clueBoosts: ClueBoost[] = [
	{
		description: '10% for Graceful',
		has: (user: User) => hasGracefulEquippedAnywhere(user),
		change: (duration: number) => duration * 0.9
	},
	{
		description: '10% for Weekend',
		has: () => isWeekend(),
		change: (duration: number) => duration * 0.9
	},
	{
		description: '10% for Achievement diary cape',
		has: (user: User) => hasItemsEquippedOrInBank(user, ['Achievement diary cape']),
		change: (duration: number) => duration * 0.9
	}
];

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
		const user = await globalClient.fetchUser(userID);
		const mahojiUser = await mahojiUsersSettingsFetch(userID);

		const clueTier = ClueTiers.find(tier => stringMatches(tier.name, options.tier));
		if (!clueTier) return 'Invalid clue tier.';

		let quantity = user.bank().amount(clueTier.scrollID);
		let duration = 0;
		for (let i = 0; i < quantity; i++) {}

		const boosts = [];

		const [timeToFinish, percentReduced] = reducedClueTime(
			clueTier,
			user.settings.get(UserSettings.OpenableScores)[clueTier.id] ?? 1
		);

		if (percentReduced >= 1) boosts.push(`${percentReduced}% for clue score`);

		const maxTripLength = user.maxTripLength('ClueCompletion');

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

		for (const boost of clueBoosts) {
			if (boost.has(mahojiUser)) {
				duration = boost.change(duration);
				boosts.push(boost.description);
			}
		}

		duration += Time.Second * randInt(1, 90);

		const clueStatuses = (await verifyClueStatusesForUser(user.id, clueTier))!.slice(0, quantity);

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
