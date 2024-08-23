import type { ChatInputCommandInteraction } from 'discord.js';
import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { LMSBuyables } from '../../../lib/data/CollectionsExport';
import { lmsSimCommand } from '../../../lib/minions/functions/lmsSimCommand';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { formatDuration, randomVariation, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { getUsersLMSStats } from '../../../tasks/minions/minigames/lmsActivity';

export async function lmsCommand(
	options: {
		stats?: {};
		start?: {};
		buy?: { name?: string; quantity?: number };
		simulate?: { names?: string };
	},
	user: MUser,
	channelID: string,
	interaction: ChatInputCommandInteraction
) {
	const stats = await getUsersLMSStats(user);

	if (options.stats) {
		return `**Last Man Standing**

**Wins:** ${stats.gamesWon}
**Reward Points:** ${stats.points}
**Average Kills Per Game:** ${stats.averageKills.toFixed(2)}
**Average Position:** ${stats.averagePosition.toFixed(2)}
**Highest Kill Match:** ${stats.highestKillInGame} kills
**Total Matches:** ${stats.totalGames}`;
	}

	if (options.simulate) {
		lmsSimCommand(globalClient.channels.cache.get(channelID.toString()), options.simulate.names);
		return {
			content: 'Starting simulation...'
		};
	}

	if (options.buy) {
		const itemToBuy = LMSBuyables.find(i => stringMatches(i.item.name, options.buy?.name ?? ''));
		if (!itemToBuy) {
			return "That's not a valid item you can buy.";
		}
		const quantity = options.buy.quantity ?? 1;
		const cost = itemToBuy.cost ? itemToBuy.cost * quantity : itemToBuy.cost;
		if (cost && stats.points < cost) {
			return `You don't have enough points. ${quantity}x ${itemToBuy.item.name} costs ${cost}, but you have ${stats.points}.`;
		}
		if (itemToBuy.wins && stats.gamesWon < itemToBuy.wins) {
			return `You are not worthy! You need to have won at least ${itemToBuy.wins} games to buy the ${itemToBuy.item.name}.`;
		}
		const loot = new Bank().add(itemToBuy.item.id, quantity * (itemToBuy.quantity ?? 1));
		await handleMahojiConfirmation(interaction, `Are you sure you want to spend ${cost} points on buying ${loot}?`);
		if (!cost) {
			await transactItems({
				userID: user.id,
				collectionLog: true,
				itemsToAdd: loot
			});
			return `You received ${loot}.`;
		}

		const { newUser } = await user.update({
			lms_points: {
				decrement: cost
			}
		});
		if (itemToBuy.onlyCL) {
			await user.addItemsToCollectionLog(loot);
		} else {
			await transactItems({
				userID: user.id,
				collectionLog: true,
				itemsToAdd: loot
			});
		}
		return `You spent ${cost} points to buy ${loot}. You now have ${newUser.lms_points} LMS points.`;
	}

	if (user.minionIsBusy) {
		return 'Your minion must not be busy to do an LMS trip';
	}
	const durationPerGame = Time.Minute * 5.5;
	const quantity = Math.floor(calcMaxTripLength(user, 'LastManStanding') / durationPerGame);
	const duration = randomVariation(quantity * durationPerGame, 5);

	await addSubTaskToActivityTask<MinigameActivityTaskOptionsWithNoChanges>({
		minigameID: 'lms',
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		type: 'LastManStanding',
		quantity
	});

	return `${
		user.minionName
	} is now off to do ${quantity} games of competitive Last Man Standing. The trip will take ${formatDuration(
		duration
	)}.`;
}
