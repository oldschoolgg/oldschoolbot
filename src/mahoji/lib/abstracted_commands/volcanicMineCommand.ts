import { objectEntries, Time } from 'e';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import { MUser } from '../../../lib/MUser';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ItemBank } from '../../../lib/types';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { formatDuration, formatSkillRequirements, resolveNameBank, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { handleMahojiConfirmation, hasSkillReqs, mahojiUserSettingsUpdate } from '../../mahojiSettings';

const skillReqs = {
	[SkillsEnum.Prayer]: 70,
	[SkillsEnum.Hitpoints]: 70,
	[SkillsEnum.Mining]: 50
};

export const VolcanicMineGameTime = Time.Minute * 10;

export const VolcanicMineShop: { name: string; output: ItemBank; cost: number; clOnly?: boolean }[] = [
	{
		name: 'Iron ore',
		output: resolveNameBank({ 'Iron ore': 1 }),
		cost: 30
	},
	{
		name: 'Silver ore',
		output: resolveNameBank({ 'Silver ore': 1 }),
		cost: 55
	},
	{
		name: 'Coal',
		output: resolveNameBank({ Coal: 1 }),
		cost: 60
	},
	{
		name: 'Gold ore',
		output: resolveNameBank({ 'Gold ore': 1 }),
		cost: 150
	},
	{
		name: 'Mithril ore',
		output: resolveNameBank({ 'Mithril ore': 1 }),
		cost: 150
	},
	{
		name: 'Adamantite ore',
		output: resolveNameBank({ 'Adamantite ore': 1 }),
		cost: 300
	},
	{
		name: 'Runite ore',
		output: resolveNameBank({ 'Runite ore': 1 }),
		cost: 855
	},
	{
		name: 'Volcanic ash',
		output: resolveNameBank({ 'Volcanic ash': 1 }),
		cost: 40
	},
	{
		name: 'Calcite',
		output: resolveNameBank({ Calcite: 1 }),
		cost: 70
	},
	{
		name: 'Pyrophosphite',
		output: resolveNameBank({ Pyrophosphite: 1 }),
		cost: 70
	},
	{
		name: 'Volcanic mine teleport',
		output: resolveNameBank({ 'Volcanic mine teleport': 1 }),
		cost: 200
	},
	{
		name: 'Large water container',
		output: resolveNameBank({ 'Large water container': 1 }),
		cost: 10_000,
		clOnly: true
	},
	{
		name: 'Ash covered tome',
		output: resolveNameBank({ 'Ash covered tome': 1 }),
		cost: 40_000,
		clOnly: true
	}
];

export async function volcanicMineCommand(user: MUser, channelID: bigint, gameQuantity: number | undefined) {
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

	let duration = VolcanicMineGameTime * gameQuantity;

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
	interaction: SlashCommandInteraction,
	user: MUser,
	item: string | undefined,
	quantity = 1
) {
	const currentUserPoints = user.user.volcanic_mine_points;
	if (!item) {
		return `You currently have ${currentUserPoints.toLocaleString()} Volcanic Mine points.`;
	}

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
			collectionLog: true,
			itemsToAdd: new Bank().add(shopItem.output).multiply(quantity)
		});
	}
	await mahojiUserSettingsUpdate(user.id, {
		volcanic_mine_points: {
			decrement: cost
		}
	});

	return `You sucessfully bought **${quantity.toLocaleString()}x ${shopItem.name}** for ${(
		shopItem.cost * quantity
	).toLocaleString()} Volcanic Mine points.${
		shopItem.clOnly
			? `\n${quantity > 1 ? 'These items were' : 'This item was'} directly added to your collection log.`
			: ''
	}`;
}
