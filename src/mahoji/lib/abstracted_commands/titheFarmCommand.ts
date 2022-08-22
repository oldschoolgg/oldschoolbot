import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import { Emoji } from '../../../lib/constants';
import TitheFarmBuyables from '../../../lib/data/buyables/titheFarmBuyables';
import { Favours, gotFavour } from '../../../lib/minions/data/kourendFavour';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { TitheFarmActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { handleMahojiConfirmation, mahojiUserSettingsUpdate } from '../../mahojiSettings';

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

export async function titheFarmCommand(user: KlasaUser, channelID: bigint) {
	if (user.minionIsBusy) {
		return 'Your minion must not be busy to use this command.';
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

	return `Your minion is off completing a round of the ${Emoji.MinigameIcon} Tithe Farm. It'll take ${formatDuration(
		duration
	)} to finish.\n\n${boostStr.length > 0 ? '**Boosts:** ' : ''}${boostStr.join(', ')}`;
}

export async function titheFarmShopCommand(
	interaction: SlashCommandInteraction,
	user: KlasaUser,
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

	const titheFarmPoints = user.settings.get(UserSettings.Stats.TitheFarmPoints);

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
