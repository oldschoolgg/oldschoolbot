import type { ChatInputCommandInteraction } from 'discord.js';
import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import { Emoji } from '../../../lib/constants';
import TitheFarmBuyables from '../../../lib/data/buyables/titheFarmBuyables';
import type { TitheFarmActivityTaskOptions } from '../../../lib/types/minions';
import { stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { minionIsBusy } from '../../../lib/util/minionIsBusy';
import { userHasGracefulEquipped, userStatsUpdate } from '../../mahojiSettings';

async function determineDuration(user: MUser): Promise<[number, string[]]> {
	let baseTime = Time.Second * 1500;
	let nonGracefulTimeAddition = Time.Second * 123;

	const boostStr = [];

	// Reduce time based on tithe farm completions
	const { tithe_farms_completed: titheFarmsCompleted } = await user.fetchStats({ tithe_farms_completed: true });
	const percentIncreaseFromCompletions = Math.floor(Math.min(50, titheFarmsCompleted) / 2) / 100;
	baseTime = Math.floor(baseTime * (1 - percentIncreaseFromCompletions));
	Math.floor(percentIncreaseFromCompletions * 100) > 0
		? boostStr.push(`${Math.floor(percentIncreaseFromCompletions * 100)}% from Tithe Farms completed`)
		: boostStr.push('');

	// Reduce time if user has graceful equipped
	if (userHasGracefulEquipped(user)) {
		nonGracefulTimeAddition = 0;
		boostStr.push('10% from graceful outfit');
	}

	const totalTime = baseTime + nonGracefulTimeAddition;

	return [totalTime, boostStr];
}

export async function titheFarmCommand(user: MUser, channelID: string) {
	if (minionIsBusy(user.id)) {
		return 'Your minion must not be busy to use this command.';
	}
	const skills = user.skillsAsLevels;
	if (skills.farming < 34) {
		return `${user} needs 34 Farming to use the Tithe Farm!`;
	}

	const [duration, boostStr] = await determineDuration(user);

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
	interaction: ChatInputCommandInteraction,
	user: MUser,
	buyableName: string,
	_quantity?: number
) {
	const buyable = TitheFarmBuyables.find(
		item => stringMatches(buyableName, item.name) || item.aliases?.some(alias => stringMatches(alias, buyableName))
	);

	if (!buyable) {
		return `I don't recognize that item, the items you can buy are: ${TitheFarmBuyables.map(item => item.name).join(
			', '
		)}.`;
	}

	const quantity = _quantity ?? 1;

	const loot = new Bank(buyable.outputItems).multiply(quantity);
	const cost = buyable.titheFarmPoints * quantity;

	const { tithe_farm_points: titheFarmPoints } = await user.fetchStats({ tithe_farm_points: true });

	if (titheFarmPoints < cost) {
		return `You need ${cost} Tithe Farm points to make this purchase.`;
	}

	const purchaseMsg = `${loot} for ${cost} Tithe Farm points`;

	await handleMahojiConfirmation(interaction, `${user}, please confirm that you want to purchase ${purchaseMsg}.`);
	await userStatsUpdate(
		user.id,
		{
			tithe_farm_points: {
				decrement: cost
			}
		},
		{}
	);

	await transactItems({
		userID: user.id,
		collectionLog: true,
		itemsToAdd: loot
	});

	return `You purchased ${loot} for ${cost} Tithe Farm points.`;
}
