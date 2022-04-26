import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import { client } from '../../..';
import { LMSBuyables } from '../../../lib/data/CollectionsExport';
import { lmsSimCommand } from '../../../lib/minions/functions/lmsSimCommand';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, randomVariation, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { getUsersLMSStats } from '../../../tasks/minions/minigames/lmsActivity';
import { handleMahojiConfirmation, mahojiUserSettingsUpdate } from '../../mahojiSettings';

export async function lmsCommand(
	options: {
		stats?: {};
		start?: {};
		buy?: { name?: string; quantity?: number };
		simulate?: { names?: string };
	},
	user: KlasaUser,
	channelID: bigint,
	interaction: SlashCommandInteraction
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
		lmsSimCommand(client.channels.cache.get(channelID.toString()), options.simulate.names);
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
			return `You are not worthy! You need to have won atleast ${itemToBuy.wins} games to buy the ${itemToBuy.item.name}.`;
		}
		const loot = new Bank().add(itemToBuy.item.id, quantity * (itemToBuy.quantity ?? 1));
		await handleMahojiConfirmation(interaction, `Are you sure you want to spend ${cost} points on buying ${loot}?`);
		if (!cost) {
			await user.addItemsToBank({ items: loot, collectionLog: true });
			return `You received ${loot}.`;
		}

		const { newUser } = await mahojiUserSettingsUpdate(client, user, {
			lms_points: {
				decrement: cost
			}
		});
		if (itemToBuy.onlyCL) {
			await user.addItemsToCollectionLog({ items: loot });
		} else {
			await user.addItemsToBank({ items: loot, collectionLog: true });
		}
		return `You spent ${cost} points to buy ${loot}. You now have ${newUser.lms_points} LMS points.`;
	}

	if (user.minionIsBusy) {
		return 'Your minion must not be busy to do an LMS trip';
	}
	const durationPerGame = Time.Minute * 5.5;
	const quantity = Math.floor(user.maxTripLength('LastManStanding') / durationPerGame);
	const duration = randomVariation(quantity * durationPerGame, 5);

	await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
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
