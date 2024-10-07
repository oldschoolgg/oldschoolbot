import { mentionCommand } from '@oldschoolgg/toolkit';
import type { Prisma } from '@prisma/client';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { BitField } from '../../../lib/constants';
import { roboChimpUserFetch } from '../../../lib/roboChimp';

import { assert } from '../../../lib/util';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { minionIsBusy } from '../../../lib/util/minionIsBusy';

export async function ironmanCommand(user: MUser, interaction: ChatInputCommandInteraction | null) {
	if (minionIsBusy(user.id)) return 'Your minion is busy.';
	if (user.isIronman) {
		return 'You are already an ironman.';
	}

	const existingGiveaways = await prisma.giveaway.findMany({
		where: {
			user_id: user.id,
			completed: false
		}
	});

	if (existingGiveaways.length !== 0) {
		return "You can't become an ironman because you have active giveaways.";
	}

	const bingos = await prisma.bingo.count({
		where: {
			creator_id: user.id
		}
	});

	if (bingos !== 0) {
		return "You can't become an ironman because you have active bingos.";
	}

	const activeListings = await prisma.gEListing.findMany({
		where: {
			user_id: user.id,
			quantity_remaining: {
				gt: 0
			},
			fulfilled_at: null,
			cancelled_at: null
		},
		include: {
			buyTransactions: true,
			sellTransactions: true
		},
		orderBy: {
			created_at: 'desc'
		}
	});
	// Return early if no active listings.
	if (activeListings.length !== 0) {
		return `You can't become an ironman because you have active Grand Exchange listings. Cancel them and try again: ${mentionCommand(
			globalClient,
			'ge',
			'cancel'
		)}`;
	}

	if (interaction) {
		await handleMahojiConfirmation(
			interaction,
			`Are you sure you want to start over and play as an ironman?
:warning: **Read the following text before confirming. This is your only warning. ** :warning:
The following things will be COMPLETELY reset/wiped from your account, with no chance of being recovered: Your entire bank, collection log, GP/Coins, QP/Quest Points, Clue Scores, Monster Scores, all XP. If you type \`confirm\`, they will all be wiped.
After becoming an ironman:
	- You will no longer be able to receive GP from  \`=daily\`
	- You will no longer be able to use \`=pay\`, \`=duel\`, \`=sellto\`, \`=sell\`, \`=dice\`, \`=gri\`
	- You **cannot** de-iron, it is PERMANENT.
    - Your entire BSO account, EVERYTHING, will be reset.
Type \`confirm permanent ironman\` if you understand the above information, and want to become an ironman now.`
		);
	}

	const mUser = (await mUserFetch(user.id)).user;

	type KeysThatArentReset =
		| 'bank_bg_hex'
		| 'bank_sort_weightings'
		| 'bank_sort_method'
		| 'minion_bought_date'
		| 'id'
		| 'pets'
		| 'RSN'
		| 'bitfield';

	const bitFieldsToKeep: BitField[] = [
		BitField.IsPatronTier1,
		BitField.IsPatronTier2,
		BitField.IsPatronTier3,
		BitField.IsPatronTier4,
		BitField.IsPatronTier5,
		BitField.isModerator,
		BitField.BypassAgeRestriction,
		BitField.HasPermanentEventBackgrounds,
		BitField.HasPermanentTierOne,
		BitField.DisabledRandomEvents,
		BitField.AlwaysSmallBank,
		BitField.IsPatronTier6
	];

	const createOptions: Required<Pick<Prisma.UserCreateInput, KeysThatArentReset>> = {
		id: user.id,
		bank_bg_hex: mUser.bank_bg_hex,
		bank_sort_method: mUser.bank_sort_method,
		bank_sort_weightings: mUser.bank_sort_weightings as ItemBank,
		minion_bought_date: mUser.minion_bought_date,
		RSN: mUser.RSN,
		pets: mUser.pets as ItemBank,
		bitfield: bitFieldsToKeep.filter(i => user.bitfield.includes(i))
	};

	// Delete tables with foreign keys first:
	await prisma.historicalData.deleteMany({ where: { user_id: user.id } });
	await prisma.botItemSell.deleteMany({ where: { user_id: user.id } });
	await prisma.pinnedTrip.deleteMany({ where: { user_id: user.id } });
	await prisma.farmedCrop.deleteMany({ where: { user_id: user.id } });
	await prisma.portent.deleteMany({ where: { user_id: user.id } });
	// Now we can delete the user
	await prisma.user.deleteMany({
		where: { id: user.id }
	});
	await prisma.user.create({
		data: createOptions
	});
	await prisma.slayerTask.deleteMany({ where: { user_id: user.id } });
	await prisma.playerOwnedHouse.deleteMany({ where: { user_id: user.id } });
	await prisma.minigame.deleteMany({ where: { user_id: user.id } });
	await prisma.xPGain.deleteMany({ where: { user_id: BigInt(user.id) } });
	await prisma.newUser.deleteMany({ where: { id: user.id } });
	await prisma.activity.deleteMany({ where: { user_id: BigInt(user.id) } });
	await prisma.stashUnit.deleteMany({ where: { user_id: BigInt(user.id) } });
	await prisma.userEvent.deleteMany({ where: { user_id: user.id } });
	await prisma.userStats.deleteMany({ where: { user_id: BigInt(user.id) } });
	await prisma.tameActivity.deleteMany({ where: { user_id: user.id } });
	await prisma.tame.deleteMany({ where: { user_id: user.id } });
	await prisma.fishingContestCatch.deleteMany({ where: { user_id: BigInt(user.id) } });
	await prisma.buyCommandTransaction.deleteMany({ where: { user_id: BigInt(user.id) } });

	// Refund the leagues points they spent
	const roboChimpUser = await roboChimpUserFetch(user.id);
	if (roboChimpUser.leagues_points_total >= 0) {
		await roboChimpClient.user.update({
			where: {
				id: BigInt(user.id)
			},
			data: {
				leagues_points_balance_bso: roboChimpUser.leagues_points_balance_bso
			}
		});
	}

	const { newUser } = await user.update({
		minion_ironman: true,
		minion_hasBought: true
	});
	assert(!newUser.GP && !newUser.QP && !newUser.skills_woodcutting, `Ironman sanity check - ID: ${newUser.id}`);
	return 'You are now an ironman.';
}
