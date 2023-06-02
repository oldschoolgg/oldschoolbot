import { calcPercentOfNum } from 'e';

import { userStatsUpdate } from '../mahoji/mahojiSettings';
import { globalConfig } from './constants';
import { prisma } from './settings/prisma';
import { assert } from './util';

const gamblingData = [
	{
		name: 'Lucky Pick',
		itemSinkKey: 'item_sink_luckypick_gp',
		economyTrackKey: 'gp_luckypick',
		personalUserKey: 'gp_luckypick'
	},
	{
		name: 'Dice',
		itemSinkKey: 'item_sink_dice_gp',
		economyTrackKey: 'gp_dice',
		personalUserKey: 'gp_dice'
	},
	{
		name: 'Slots',
		itemSinkKey: 'item_sink_slots_gp',
		economyTrackKey: 'gp_slots',
		personalUserKey: 'gp_slots'
	},
	{
		name: 'Hot and Cold',
		itemSinkKey: 'item_sink_hotcold_gp',
		economyTrackKey: 'gp_hotcold',
		personalUserKey: 'gp_hotcold'
	},
	{
		name: 'Spins',
		itemSinkKey: 'item_sink_spins_gp',
		economyTrackKey: 'gp_spins',
		personalUserKey: 'gp_spins'
	}
] as const;

export const ITEM_SINK_TAX_PERCENT = 5;

/**
 * If the total amount is negative, its GP that was lost by the player, and removed from the economy.
 * We store this a negative number, showing "-500m" was removed from the economy.
 */
export async function handleGamblingOutcome({
	type,
	user,
	totalAmount
}: {
	type: (typeof gamblingData)[number]['name'];
	user: MUser;
	totalAmount: number;
}) {
	const { personalUserKey, economyTrackKey, itemSinkKey } = gamblingData.find(data => data.name === type)!;
	await userStatsUpdate(user.id, {
		[personalUserKey]: {
			increment: totalAmount
		}
	});

	const taxableAmount = totalAmount < 0 ? Math.abs(totalAmount) : 0;
	const taxedAmount = Math.floor(calcPercentOfNum(ITEM_SINK_TAX_PERCENT, taxableAmount));
	if (taxableAmount === 0) {
		assert(taxedAmount === 0);
	}

	await prisma.clientStorage.update({
		where: {
			id: globalConfig.clientID
		},
		data: {
			[itemSinkKey]: {
				increment: taxedAmount
			},
			item_sink_tax_bank: {
				increment: taxedAmount
			},
			item_sink_tax_bank_total: {
				increment: taxedAmount
			},
			[economyTrackKey]: {
				increment: totalAmount + taxedAmount
			}
		},
		select: {
			id: true
		}
	});
}
