import type { ChatInputCommandInteraction } from 'discord.js';
import { Time, objectEntries } from 'e';
import { Bank } from 'oldschooljs';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import { getMinigameScore } from '../../../lib/settings/minigames';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { formatSkillRequirements, hasSkillReqs, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';

const skillReqs = {
	[SkillsEnum.Prayer]: 70,
	[SkillsEnum.Hitpoints]: 70,
	[SkillsEnum.Mining]: 50
};

export const VolcanicMineGameTime = Time.Minute * 10;

export const VolcanicMineShop: { name: string; output: Bank; cost: number; clOnly?: boolean; addToCl?: true }[] = [
	{
		name: 'Iron ore',
		output: new Bank({ 'Iron ore': 1 }),
		cost: 30
	},
	{
		name: 'Silver ore',
		output: new Bank({ 'Silver ore': 1 }),
		cost: 55
	},
	{
		name: 'Coal',
		output: new Bank({ Coal: 1 }),
		cost: 60
	},
	{
		name: 'Gold ore',
		output: new Bank({ 'Gold ore': 1 }),
		cost: 150
	},
	{
		name: 'Mithril ore',
		output: new Bank({ 'Mithril ore': 1 }),
		cost: 150
	},
	{
		name: 'Adamantite ore',
		output: new Bank({ 'Adamantite ore': 1 }),
		cost: 300
	},
	{
		name: 'Runite ore',
		output: new Bank({ 'Runite ore': 1 }),
		cost: 855
	},
	{
		name: 'Volcanic ash',
		output: new Bank({ 'Volcanic ash': 1 }),
		cost: 40
	},
	{
		name: 'Calcite',
		output: new Bank({ Calcite: 1 }),
		cost: 70
	},
	{
		name: 'Pyrophosphite',
		output: new Bank({ Pyrophosphite: 1 }),
		cost: 70
	},
	{
		name: 'Ore pack (Volcanic Mine)',
		output: new Bank({ 'Ore pack (Volcanic Mine)': 1 }),
		cost: 4000,
		addToCl: true
	},
	{
		name: 'Volcanic mine teleport',
		output: new Bank({ 'Volcanic mine teleport': 1 }),
		cost: 200,
		addToCl: true
	},
	{
		name: 'Large water container',
		output: new Bank({ 'Large water container': 1 }),
		cost: 10_000,
		clOnly: true
	},
	{
		name: 'Ash covered tome',
		output: new Bank({ 'Ash covered tome': 1 }),
		cost: 40_000,
		clOnly: true
	}
];

export async function volcanicMineCommand(user: MUser, channelID: string, gameQuantity: number | undefined) {
	const skills = user.skillsAsLevels;
	if (!hasSkillReqs(user, skillReqs)[0]) {
		return `You are not skilled enough to participate in the Volcanic Mine. You need the following requirements: ${objectEntries(
			skillReqs
		)
			.map(s => {
				return skills[s[0]] < s[1] ? formatSkillRequirements({ [s[0]]: s[1] }, true) : undefined;
			})
			.filter(f => f)
			.join(', ')}`;
	}
	const maxGamesUserCanDo = Math.floor(calcMaxTripLength(user) / VolcanicMineGameTime);
	if (!gameQuantity || gameQuantity > maxGamesUserCanDo) gameQuantity = maxGamesUserCanDo;
	const userMiningLevel = skills.mining;
	const userPrayerLevel = skills.prayer;
	const userHitpointsLevel = skills.hitpoints;
	const { gear } = user;
	const userSkillingGear = gear.skilling;
	const boosts: string[] = [];

	const suppliesUsage = new Bank()
		.add('Saradomin brew (4)', userHitpointsLevel < 80 ? 3 : 2)
		.add('Prayer potion (4)', 1)
		.add('Numulite', 30);

	// Activity boosts
	if (userMiningLevel >= 71 && userSkillingGear.hasEquipped('Crystal pickaxe')) {
		boosts.push(`50% boost for having a ${userSkillingGear.equippedWeapon()?.name ?? 'Crystal pickaxe'} equipped.`);
	} else if (userMiningLevel >= 61 && userSkillingGear.hasEquipped('Dragon pickaxe')) {
		boosts.push(`30% boost for having a ${userSkillingGear.equippedWeapon()?.name ?? 'Dragon pickaxe'} equipped.`);
	}

	if (
		userSkillingGear.hasEquipped(
			['Prospector helmet', 'Prospector jacket', 'Prospector legs', 'Prospector boots'],
			true
		)
	) {
		boosts.push('2.5% more Mining XP for having the Propector outfit equipped.');
	}

	if (userSkillingGear.hasEquipped('Elysian spirit shield')) {
		suppliesUsage.remove('Saradomin brew (4)', 1);
		boosts.push('Lower Saradomin Brew usage for having an Elysian spirit shield equipped.');
	}

	if (userPrayerLevel >= 90 || (userSkillingGear.hasEquipped('Dragonbone necklace') && userPrayerLevel >= 80)) {
		suppliesUsage.remove('Prayer potion (4)', 1);
		boosts.push(
			userPrayerLevel >= 90
				? 'No prayer potion usage for having 90+ Prayer.'
				: 'No prayer potion usage for having 80+ prayer and a Dragonbone necklace equipped.'
		);
	}

	suppliesUsage.multiply(gameQuantity);
	const { bank } = user;
	if (!bank.has(suppliesUsage)) {
		return `You don't have all the required supplies for this number of games. You need ${suppliesUsage} for ${gameQuantity} games of Volcanic Mine.`;
	}

	await transactItems({ userID: user.id, itemsToRemove: suppliesUsage });

	const duration = VolcanicMineGameTime * gameQuantity;

	const str = `${
		user.minionName
	} is now playing ${gameQuantity}x games of Volcanic Mine. It will be back in ${formatDuration(duration)}.${
		boosts.length > 0 ? `\n**Boosts**\n${boosts.join('\n')}` : ''
	}\n**Supply Usage:** ${suppliesUsage}`;

	await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity: gameQuantity,
		duration,
		type: 'VolcanicMine'
	});

	return str;
}

export async function volcanicMineShopCommand(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	item: string,
	quantity = 1
) {
	const currentUserPoints = user.user.volcanic_mine_points;

	const shopItem = VolcanicMineShop.find(f => stringMatches(f.name, item));
	if (!shopItem) {
		return `This is not a valid item to buy. These are the items that can be bought using Volcanic Mine points: ${VolcanicMineShop.map(
			v => v.name
		).join(', ')}`;
	}
	const cost = quantity * shopItem.cost;
	if (cost > currentUserPoints) {
		return `You don't have enough points to buy ${quantity.toLocaleString()}x ${shopItem.name}. ${
			currentUserPoints < shopItem.cost
				? "You don't have enough points for any of this item."
				: `You only have enough for ${Math.floor(currentUserPoints / shopItem.cost).toLocaleString()}`
		}`;
	}
	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to spent **${cost.toLocaleString()}** Volcanic Mine points to buy **${quantity.toLocaleString()}x ${
			shopItem.name
		}**?`
	);

	if (shopItem.clOnly) {
		await user.addItemsToCollectionLog(new Bank().add(shopItem.output).multiply(quantity));
	} else {
		await transactItems({
			userID: user.id,
			collectionLog: shopItem.addToCl === true,
			itemsToAdd: new Bank().add(shopItem.output).multiply(quantity)
		});
	}
	await user.update({
		volcanic_mine_points: {
			decrement: cost
		}
	});

	return `You sucessfully bought **${quantity.toLocaleString()}x ${shopItem.name}** for ${(shopItem.cost * quantity).toLocaleString()} Volcanic Mine points.${
		shopItem.clOnly
			? `\n${quantity > 1 ? 'These items were' : 'This item was'} directly added to your collection log.`
			: ''
	}`;
}

export async function volcanicMineStatsCommand(user: MUser) {
	const currentUserPoints = user.user.volcanic_mine_points;
	const kc = await getMinigameScore(user.id, 'volcanic_mine');

	return `You have ${currentUserPoints.toLocaleString()} Volcanic Mine points.
You have completed ${kc} games of Volcanic Mine.`;
}
