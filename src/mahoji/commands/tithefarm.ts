import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { client } from '../..';
import { Emoji } from '../../lib/constants';
import TitheFarmBuyables from '../../lib/data/buyables/titheFarmBuyables';
import { Favours, gotFavour } from '../../lib/minions/data/kourendFavour';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { TitheFarmActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, multiplyBank, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation } from '../mahojiSettings';

function determineDuration(user: KlasaUser): [number, string[]] {
	let baseTime = Time.Second * 1500;
	let nonGracefulTimeAddition = Time.Second * 123;

	const boostStr = [];

	// Reduce time based on tithe farm completions
	const titheFarmsCompleted = user.settings.get(UserSettings.Stats.TitheFarmsCompleted);
	const percentIncreaseFromCompletions = Math.floor(Math.min(50, titheFarmsCompleted) / 2) / 100;
	baseTime = Math.floor(baseTime * (1 - percentIncreaseFromCompletions));
	Math.floor(percentIncreaseFromCompletions * 100) > 0
		? boostStr.push(`${Math.floor(percentIncreaseFromCompletions * 100)}% from Tithe Farms completed`)
		: boostStr.push('');

	// Reduce time if user has graceful equipped
	if (user.hasGracefulEquipped()) {
		nonGracefulTimeAddition = 0;
		boostStr.push('10% from graceful outfit');
	}

	const totalTime = baseTime + nonGracefulTimeAddition;

	return [totalTime, boostStr];
}

export const tithefarmCommand: OSBMahojiCommand = {
	name: 'tithefarm',
	description: 'Send your minion to complete the tithe farm minigame',
	attributes: {
		requiresMinion: true,
		categoryFlags: ['minion', 'skilling', 'minigame'],
		description: 'Send your minion to complete the tithe farm minigame.',
		examples: ['/tithefarm start', '/tithefarm buy']
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'start',
			description: 'Send your minion to complete the tithe farm minigame.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'points',
			description: 'See your tithe farm points'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'buy',
			description: "Allows a player to purchase farmer's items from the tithefarm shop.",
			options: [
				{
					name: 'name',
					description: 'The item you want to purchase.',
					type: ApplicationCommandOptionType.String,
					required: true,
					autocomplete: async (value: string) => {
						return TitheFarmBuyables.filter(i =>
							!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
						).map(i => ({ name: i.name, value: i.name }));
					}
				},
				{
					name: 'quantity',
					description: 'The quantity you want to purchase.',
					type: ApplicationCommandOptionType.Integer,
					required: false,
					min_value: 1,
					max_value: 1000
				}
			]
		}
	],
	run: async ({
		channelID,
		options,
		interaction,
		userID
	}: CommandRunOptions<{
		start?: {};
		points?: {};
		buy?: { name?: string; quantity?: number };
	}>) => {
		const user = await client.fetchUser(userID.toString());
		await user.settings.sync(true);
		if (options.buy) {
			const buyable = TitheFarmBuyables.find(i => stringMatches(i.name, options.buy?.name ?? ''));
			const quantity = options.buy.quantity ?? 1;
			if (!buyable) {
				return "I don't recognize that item";
			}
			const outItems = multiplyBank(buyable.outputItems, quantity);
			const itemString = new Bank(outItems).toString();

			const titheFarmPoints = user.settings.get(UserSettings.Stats.TitheFarmPoints);

			const titheFarmPointsCost = buyable.titheFarmPoints * quantity;

			if (titheFarmPoints < titheFarmPointsCost) {
				return `You need ${titheFarmPointsCost} Tithe Farm points to make this purchase.`;
			}

			let purchaseMsg = `${itemString} for ${titheFarmPointsCost} Tithe Farm points`;
			await handleMahojiConfirmation(
				channelID,
				userID,
				interaction,
				`${user}, please confirm you want to purchase ${purchaseMsg}.`
			);

			await user.settings.update(UserSettings.Stats.TitheFarmPoints, titheFarmPoints - titheFarmPointsCost);

			await user.addItemsToBank({ items: outItems, collectionLog: true });

			return `You purchased ${itemString} for ${titheFarmPointsCost} Tithe Farm points.`;
		}
		if (options.points) {
			const titheFarmPoints = user.settings.get(UserSettings.Stats.TitheFarmPoints);
			return `You have ${titheFarmPoints} Tithe Farm points.`;
		}
		if (user.minionIsBusy) {
			return 'Your minion must not be busy to do a tithefarm trip';
		}
		if (user.skillLevel(SkillsEnum.Farming) < 34) {
			return `${user.minionName} needs 34 Farming to use the Tithe Farm!`;
		}
		const [hasFavour, requiredPoints] = gotFavour(user, Favours.Hosidius, 100);
		if (!hasFavour) {
			return `${user.minionName} needs ${requiredPoints}% Hosidius Favour to use the Tithe Farm!`;
		}

		const [duration, boostStr] = determineDuration(user);
		await addSubTaskToActivityTask<TitheFarmActivityTaskOptions>({
			minigameID: 'tithe_farm',
			userID: user.id,
			channelID: channelID.toString(),
			quantity: 1,
			duration,
			type: 'TitheFarm'
		});

		return `Your minion is off completing a round of the ${
			Emoji.MinigameIcon
		} Tithe Farm. It'll take ${formatDuration(duration)} to finish.\n\n${
			boostStr[0] !== '' ? '**Boosts:** ' : ''
		}${boostStr.join(', ')}`;
	}
};
