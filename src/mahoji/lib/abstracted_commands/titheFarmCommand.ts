import { Time } from 'e';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import { Emoji } from '../../../lib/constants';
import TitheFarmBuyables from '../../../lib/data/buyables/titheFarmBuyables';
import { Favours, gotFavour } from '../../../lib/minions/data/kourendFavour';
import { TitheFarmActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { minionIsBusy } from '../../../lib/util/minionIsBusy';
import { handleMahojiConfirmation, mahojiUserSettingsUpdate, userHasGracefulEquipped } from '../../mahojiSettings';

function determineDuration(user: MUser): [number, string[]] {
	let baseTime = Time.Second * 1500;
	let nonGracefulTimeAddition = Time.Second * 123;

	const boostStr = [];

	// Reduce time based on tithe farm completions
	const titheFarmsCompleted = user.user.stats_titheFarmsCompleted;
	const percentIncreaseFromCompletions = Math.floor(Math.min(50, titheFarmsCompleted) / 2) / 100;
	baseTime = Math.floor(baseTime * (1 - percentIncreaseFromCompletions));
	Math.floor(percentIncreaseFromCompletions * 100) > 0
		? boostStr.push(`${Math.floor(percentIncreaseFromCompletions * 100)}% from Tithe Farms completed`)
		: boostStr.push('');

	// Reduce time if user has graceful equipped
	if (userHasGracefulEquipped(user.user)) {
		nonGracefulTimeAddition = 0;
		boostStr.push('10% from graceful outfit');
	}

	const totalTime = baseTime + nonGracefulTimeAddition;

	return [totalTime, boostStr];
}

export async function titheFarmCommand(user: MUser, channelID: bigint) {
	if (minionIsBusy(user.id)) {
		return 'Your minion must not be busy to use this command.';
	}
	const skills = user.skillsAsLevels;
	if (skills.farming < 34) {
		return `${user} needs 34 Farming to use the Tithe Farm!`;
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

	return `Your minion is off completing a round of the ${Emoji.MinigameIcon} Tithe Farm. It'll take ${formatDuration(
		duration
	)} to finish.\n\n${boostStr.length > 0 ? '**Boosts:** ' : ''}${boostStr.join(', ')}`;
}

export async function titheFarmShopCommand(
	interaction: SlashCommandInteraction,
	user: MUser,
	buyableName: string,
	_quantity?: number
) {
	const buyable = TitheFarmBuyables.find(
		item =>
			stringMatches(buyableName, item.name) ||
			(item.aliases && item.aliases.some(alias => stringMatches(alias, buyableName)))
	);

	if (!buyable) {
		return `I don't recognize that item, the items you can buy are: ${TitheFarmBuyables.map(item => item.name).join(
			', '
		)}.`;
	}

	const quantity = _quantity ?? 1;

	const loot = new Bank(buyable.outputItems).multiply(quantity);
	const cost = buyable.titheFarmPoints * quantity;

	const titheFarmPoints = user.user.stats_titheFarmPoints;

	if (titheFarmPoints < cost) {
		return `You need ${cost} Tithe Farm points to make this purchase.`;
	}

	let purchaseMsg = `${loot} for ${cost} Tithe Farm points`;

	await handleMahojiConfirmation(interaction, `${user}, please confirm that you want to purchase ${purchaseMsg}.`);
	await mahojiUserSettingsUpdate(user.id, {
		stats_titheFarmPoints: {
			decrement: cost
		}
	});

	await transactItems({
		userID: user.id,
		collectionLog: true,
		itemsToAdd: loot
	});

	return `You purchased ${loot} for ${cost} Tithe Farm points.`;
}
