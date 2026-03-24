import { Emoji, formatDuration, stringMatches, Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import TitheFarmBuyables from '@/lib/data/buyables/titheFarmBuyables.js';
import type { TitheFarmActivityTaskOptions } from '@/lib/types/minions.js';

async function determineDuration(user: MUser): Promise<[number, string[]]> {
	let baseTime = Time.Second * 1500;
	let nonGracefulTimeAddition = Time.Second * 123;

	const boostStr = [];

	// Reduce time based on tithe farm completions
	const { tithe_farms_completed: titheFarmsCompleted } = await user.fetchStats();
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

export async function titheFarmCommand(user: MUser, channelId: string) {
	if (await user.minionIsBusy()) {
		return 'Your minion must not be busy to use this command.';
	}
	const skills = user.skillsAsLevels;
	if (skills.farming < 34) {
		return `${user} needs 34 Farming to use the Tithe Farm!`;
	}

	const [duration, boostStr] = await determineDuration(user);

	await ActivityManager.startTrip<TitheFarmActivityTaskOptions>({
		minigameID: 'tithe_farm',
		userID: user.id,
		channelId,
		quantity: 1,
		duration,
		type: 'TitheFarm'
	});

	return `Your minion is off completing a round of the ${Emoji.MinigameIcon} Tithe Farm. It'll take ${formatDuration(
		duration
	)} to finish.\n\n${boostStr.length > 0 ? '**Boosts:** ' : ''}${boostStr.join(', ')}`;
}

export async function titheFarmShopCommand(
	interaction: MInteraction,
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

	const { tithe_farm_points: titheFarmPoints } = await user.fetchStats();

	if (titheFarmPoints < cost) {
		const maxCanAfford = Math.floor(titheFarmPoints / buyable.titheFarmPoints);
		return `You need ${cost.toLocaleString()} Tithe Farm points to make this purchase, but you only have ${titheFarmPoints.toLocaleString()}. You can currently afford ${maxCanAfford.toLocaleString()}x ${buyable.name}.`;
	}

	const purchaseMsg = `${loot} for ${cost} Tithe Farm points`;

	await interaction.confirmation(`${user}, please confirm that you want to purchase ${purchaseMsg}.`);
	await user.statsUpdate({
		tithe_farm_points: {
			decrement: cost
		}
	});

	await user.transactItems({
		collectionLog: true,
		itemsToAdd: loot
	});

	return `You purchased ${loot} for ${cost.toLocaleString()} Tithe Farm points. You now have ${(titheFarmPoints - cost).toLocaleString()} points left.`;
}

export async function titheFarmShopInfoCommand(user: MUser) {
	const { tithe_farm_points: titheFarmPoints } = await user.fetchStats();

	const priceList = TitheFarmBuyables.map(
		buyable => `- ${buyable.name}: ${buyable.titheFarmPoints.toLocaleString()} points`
	).join('\n');

	return `${user}, you currently have **${titheFarmPoints.toLocaleString()} Tithe Farm points**.\n\n**Tithe Farm reward costs:**\n${priceList}`;
}
