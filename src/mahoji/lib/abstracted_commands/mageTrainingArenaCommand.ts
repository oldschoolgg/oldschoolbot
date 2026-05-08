import { formatDuration, stringMatches, Time } from '@oldschoolgg/toolkit';
import { Bank, Items, LootTable } from 'oldschooljs';

import { getNewUser } from '@/lib/settings/settings.js';
import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';
import { determineRunes } from '@/lib/util/determineRunes.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';
import { pizazzPointsPerHour } from '@/tasks/minions/minigames/mageTrainingArenaActivity.js';

const RuneTable = new LootTable()
	.every('Law rune', [36, 40])
	.every('Cosmic rune', [89, 97])
	.every('Nature rune', [85, 93])
	.every('Fire rune', [170, 190]);

const bonesToPeachesItem = Items.getOrThrow('Bones to peaches');

export const mageTrainingArenaBuyables = [
	{
		item: Items.getOrThrow('Infinity gloves'),
		cost: 420
	},
	{
		item: Items.getOrThrow('Infinity hat'),
		cost: 810
	},
	{
		item: Items.getOrThrow('Infinity top'),
		cost: 960
	},
	{
		item: Items.getOrThrow('Infinity bottoms'),
		cost: 1110
	},
	{
		item: Items.getOrThrow('Infinity boots'),
		cost: 280
	},
	{
		item: Items.getOrThrow('Beginner wand'),
		cost: 30
	},
	{
		item: Items.getOrThrow('Apprentice wand'),
		cost: 71,
		upgradesFrom: Items.getOrThrow('Beginner wand')
	},
	{
		item: Items.getOrThrow('Teacher wand'),
		cost: 143,
		upgradesFrom: Items.getOrThrow('Apprentice wand')
	},
	{
		item: Items.getOrThrow('Master wand'),
		cost: 575,
		upgradesFrom: Items.getOrThrow('Teacher wand')
	},
	{
		item: Items.getOrThrow("Mage's book"),
		cost: 1115
	},
	{
		item: Items.getOrThrow('Rune pouch'),
		cost: 400
	},
	{
		item: bonesToPeachesItem,
		cost: 600
	}
];

export async function mageTrainingArenaBuyCommand(user: MUser, input = '') {
	const buyable = mageTrainingArenaBuyables.find(i => stringMatches(input, i.item.name));
	if (!buyable) {
		return `Here are the items you can buy: \n\n${mageTrainingArenaBuyables
			.map(i => `**${i.item.name}:** ${i.cost} points`)
			.join('\n')}.`;
	}

	const { item, cost, upgradesFrom } = buyable;

	const isBonesToPeaches = item.id === bonesToPeachesItem.id;

	const newUser = await getNewUser(user.id);
	const balance = newUser.pizazz_points;

	if (upgradesFrom && !user.owns(upgradesFrom.id)) {
		return `To buy a ${item.name}, you need to upgrade to it with a ${upgradesFrom.name}, which you do not own.`;
	}

	if (isBonesToPeaches && user.cl.amount(item.id) > 0) {
		return 'You have already unlocked the Bones to peaches spell.';
	}

	if (balance < cost) {
		return `You don't have enough Pizazz Points to buy the ${item.name}. You need ${cost}, but you have only ${balance}.`;
	}

	if (upgradesFrom) {
		await user.removeItemsFromBank(new Bank().add(upgradesFrom.id));
	}

	await prisma.newUser.update({
		where: {
			id: user.id
		},
		data: {
			pizazz_points: {
				decrement: cost
			}
		}
	});

	if (isBonesToPeaches) {
		await user.addItemsToCollectionLog({ itemsToAdd: new Bank().add(item.id) });
		return `Successfully unlocked the ${item.name} spell for ${cost} Pizazz Points.`;
	}

	await user.addItemsToBank({ items: new Bank().add(item.id, 1), collectionLog: true });

	return `Successfully purchased 1x ${item.name} for ${cost} Pizazz Points.`;
}

export async function mageTrainingArenaPointsCommand(user: MUser) {
	const parsedUser = await getNewUser(user.id);

	const rewardsList = mageTrainingArenaBuyables
		.map(buyable => {
			const duration = Math.round((buyable.cost / pizazzPointsPerHour) * (Time.Minute * 60));
			return `${buyable.item.name} - ${buyable.cost} pts - ${formatDuration(duration)}`;
		})
		.join('\n');

	return `You have **${parsedUser.pizazz_points.toLocaleString()}** Pizazz points.\n**Pizazz Points Per Hour:** ${pizazzPointsPerHour}\n${rewardsList}\n\nNote: Apprentice, Teacher, and Master wands are sequential upgrades that require turning in the previous wand.\n\nHint: Magic Training Arena is combined into 1 room, and 1 set of points - rewards take approximately the same amount of time to get. To get started use **/minigames mage_training_arena start**. You can buy rewards using **/minigames mage_training_arena buy**.`;
}

export async function mageTrainingArenaStartCommand(user: MUser, channelId: string): CommandResponse {
	if (await user.minionIsBusy()) return `${user.minionName} is currently busy.`;

	const roomDuration = Time.Minute * 14;
	const quantity = Math.floor((await user.calcMaxTripLength('MageTrainingArena')) / roomDuration);
	const duration = quantity * roomDuration;

	const cost = determineRunes(user, new Bank().add(RuneTable.roll())).multiply(quantity);

	if (!user.owns(cost)) {
		return `You don't have enough items for this trip, you need: ${cost}.`;
	}

	await user.transactItems({ itemsToRemove: cost });

	await ClientSettings.updateBankSetting('mta_cost', cost);

	await ActivityManager.startTrip<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelId,
		duration,
		type: 'MageTrainingArena',
		quantity,
		minigameID: 'magic_training_arena'
	});

	return `${
		user.minionName
	} is now doing ${quantity} Magic Training Arena rooms. The trip will return in about around ${formatTripDuration(user, duration)}. Removed ${cost} from your bank.`;
}
