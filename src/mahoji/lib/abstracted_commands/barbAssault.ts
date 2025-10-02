import { randomVariation, roll } from '@oldschoolgg/rng';
import {
	calcWhatPercent,
	formatDuration,
	makeComponents,
	reduceNumByPercent,
	round,
	stringMatches,
	Time
} from '@oldschoolgg/toolkit';
import type { ButtonBuilder } from 'discord.js';
import { Bank, Items } from 'oldschooljs';
import { clamp } from 'remeda';

import { buildClueButtons } from '@/lib/clues/clueUtils.js';
import { degradeItem } from '@/lib/degradeableItems.js';
import { HighGambleTable, LowGambleTable, MediumGambleTable } from '@/lib/simulation/baGamble.js';
import { maxOtherStats } from '@/lib/structures/Gear.js';
import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

export const BarbBuyables = [
	{
		item: Items.getOrThrow('Fighter hat'),
		cost: 275 * 4
	},
	{
		item: Items.getOrThrow('Ranger hat'),
		cost: 275 * 4
	},
	{
		item: Items.getOrThrow('Healer hat'),
		cost: 275 * 4
	},
	{
		item: Items.getOrThrow('Runner hat'),
		cost: 275 * 4
	},
	{
		item: Items.getOrThrow('Fighter torso'),
		cost: 375 * 4
	},
	{
		item: Items.getOrThrow('Penance skirt'),
		cost: 375 * 4
	},
	{
		item: Items.getOrThrow('Runner boots'),
		cost: 100 * 4
	},
	{
		item: Items.getOrThrow('Penance gloves'),
		cost: 150 * 4
	}
];

const levels = [
	{
		level: 2,
		cost: 200 * 4
	},
	{
		level: 3,
		cost: 300 * 4
	},
	{
		level: 4,
		cost: 400 * 4
	},
	{
		level: 5,
		cost: 500 * 4
	}
];

export const GambleTiers = [
	{
		name: 'Low',
		cost: 200,
		table: LowGambleTable
	},
	{
		name: 'Medium',
		cost: 400,
		table: MediumGambleTable
	},
	{
		name: 'High',
		cost: 500,
		table: HighGambleTable
	}
];

export async function barbAssaultLevelCommand(user: MUser) {
	const stats = await user.fetchStats();
	const currentLevel = stats.honour_level;
	if (currentLevel === 5) {
		return "You've already reached the highest possible Honour level.";
	}

	const points = stats.honour_points;

	for (const level of levels) {
		if (currentLevel >= level.level) continue;
		if (points < level.cost) {
			return `You don't have enough points to upgrade to level ${level.level}. You need ${level.cost} points.`;
		}
		await user.statsUpdate({
			honour_level: { increment: 1 },
			honour_points: { decrement: level.cost }
		});

		return `You've spent ${level.cost} Honour points to level up to Honour level ${level.level}!`;
	}

	return "You've already reached the highest possible Honour level.";
}

export async function barbAssaultBuyCommand(interaction: MInteraction, user: MUser, input: string, quantity?: number) {
	if (typeof input !== 'string') input = '';
	const buyable = BarbBuyables.find(i => stringMatches(input, i.item.name));
	if (!buyable) {
		return `Here are the items you can buy: \n\n${BarbBuyables.map(
			i => `**${i.item.name}:** ${i.cost} points`
		).join('\n')}.`;
	}

	if (!quantity) {
		quantity = 1;
	}

	const { item, cost } = buyable;
	const stats = await user.fetchStats();
	const balance = stats.honour_points;
	if (balance < cost * quantity) {
		return `You don't have enough Honour Points to buy ${quantity.toLocaleString()}x ${item.name}. You need ${(cost * quantity).toLocaleString()}, but you have only ${balance.toLocaleString()}.`;
	}
	await interaction.confirmation(
		`Are you sure you want to buy ${quantity.toLocaleString()}x ${item.name}, for ${(cost * quantity).toLocaleString()} honour points?`
	);
	await user.statsUpdate({
		honour_points: {
			decrement: cost * quantity
		}
	});

	await user.addItemsToBank({ items: new Bank().add(item.id, quantity), collectionLog: true });

	return `Successfully purchased ${quantity.toLocaleString()}x ${item.name} for ${(cost * quantity).toLocaleString()} Honour Points.`;
}

export async function barbAssaultGambleCommand(interaction: MInteraction, user: MUser, tier: string, quantity = 1) {
	const buyable = GambleTiers.find(i => stringMatches(tier, i.name));
	if (!buyable) {
		return 'You can gamble your points for the Low, Medium and High tiers. For example, `/minigames gamble low`.';
	}
	const { honour_points: balance } = await user.fetchStats();
	const { cost, name, table } = buyable;
	if (balance < cost * quantity) {
		return `You don't have enough Honour Points to do ${quantity.toLocaleString()}x ${name} gamble. You need ${(cost * quantity).toLocaleString()}, but you have only ${balance.toLocaleString()}.`;
	}
	await interaction.confirmation(
		`Are you sure you want to do ${quantity.toLocaleString()}x ${name} gamble, using ${(cost * quantity).toLocaleString()} honour points?`
	);
	await user.statsUpdate({
		honour_points: {
			decrement: cost * quantity
		},
		high_gambles:
			name === 'High'
				? {
						increment: quantity
					}
				: undefined
	});
	const loot = new Bank().add(table.roll(quantity));
	const { itemsAdded, previousCL } = await user.addItemsToBank({ items: loot, collectionLog: true });
	const str = `You spent ${(cost * quantity).toLocaleString()} Honour Points for ${quantity.toLocaleString()}x ${name} Gamble, and received... ${loot}`;

	const perkTier = user.perkTier();
	const components: ButtonBuilder[] = buildClueButtons(loot, perkTier, user);

	const response: Awaited<CommandResponse> = {
		content: str,
		files: [
			(
				await makeBankImage({
					bank: itemsAdded,
					user,
					previousCL,
					flags: { showNewCL: 1 }
				})
			).file
		],
		components: components.length > 0 ? makeComponents(components) : undefined
	};
	return response;
}

export async function barbAssaultStartCommand(channelID: string, user: MUser) {
	const boosts = [];

	let waveTime = randomVariation(Time.Minute * 4, 10);

	// Up to 12.5% speed boost for max strength
	if (roll(4)) {
		const gearStats = user.gear.melee.stats;
		const strengthPercent = round(calcWhatPercent(gearStats.melee_strength, maxOtherStats.melee_strength) / 8, 2);
		waveTime = reduceNumByPercent(waveTime, strengthPercent);
		boosts.push(`${strengthPercent}% for ${user.usernameOrMention}'s melee gear`);
	}
	// Up to 30% speed boost for honour level
	const stats = await user.fetchStats();
	const totalLevelPercent = stats.honour_level * 6;
	boosts.push(`${totalLevelPercent}% for honour level`);
	waveTime = reduceNumByPercent(waveTime, totalLevelPercent);

	// Up to 10%, at 200 kc, speed boost for team average kc
	const kc = await user.fetchMinigameScore('barb_assault');
	const kcPercent = clamp(calcWhatPercent(kc, 200), { min: 1, max: 100 });
	const kcPercentBoost = kcPercent / 10;
	boosts.push(`${kcPercentBoost.toFixed(2)}% for average KC`);
	waveTime = reduceNumByPercent(waveTime, kcPercentBoost);

	let quantity = Math.floor(user.calcMaxTripLength('BarbarianAssault') / waveTime);

	// 10% speed boost for Venator bow
	const venatorBowChargesPerWave = 50;
	const totalVenChargesUsed = venatorBowChargesPerWave * quantity;
	let venBowMsg = '';
	if (user.gear.range.hasEquipped('Venator Bow') && user.user.venator_bow_charges >= totalVenChargesUsed) {
		await degradeItem({
			item: Items.getOrThrow('Venator Bow'),
			chargesToDegrade: totalVenChargesUsed,
			user
		});
		boosts.push('10% for venator bow.');
		venBowMsg = `\n\nYou have used ${totalVenChargesUsed} charges on your Venator bow, and have ${user.user.venator_bow_charges} remaining.`;
		waveTime = reduceNumByPercent(waveTime, 10);
	}

	quantity = Math.floor(user.calcMaxTripLength('BarbarianAssault') / waveTime);

	const duration = quantity * waveTime;

	boosts.push(`Each wave takes ${formatDuration(waveTime)}`);

	let str = `${
		user.minionName
	} is now off to do ${quantity} waves of Barbarian Assault. Each wave takes ${formatDuration(
		waveTime
	)} - the total trip will take ${formatDuration(duration)}.`;

	str += `\n\n**Boosts:** ${boosts.join(', ')}.${venBowMsg}`;
	await ActivityManager.startTrip<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID,
		quantity,
		duration,
		type: 'BarbarianAssault',
		minigameID: 'barb_assault'
	});

	return str;
}

export async function barbAssaultStatsCommand(user: MUser) {
	const stats = await user.fetchStats();
	return `**Honour Points:** ${stats.honour_points}
**Honour Level:** ${stats.honour_level}
**High Gambles:** ${stats.high_gambles}`;
}
