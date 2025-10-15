import type { Prisma } from '@prisma/client';
import type { ItemBank } from 'oldschooljs';

import { BitField, DELETED_USER_ID } from '@/lib/constants.js';
import { mentionCommand } from '@/lib/discord/utils.js';
import { roboChimpUserFetch } from '@/lib/roboChimp.js';
import { assert } from '@/lib/util/logError.js';

export async function ironmanCommand(user: MUser, interaction: MInteraction | null, permanent?: boolean) {
	if (user.minionIsBusy) return 'Your minion is busy.';
	if (user.isIronman) {
		const isPerm = user.bitfield.includes(BitField.PermanentIronman);
		if (isPerm) return "You're a **permanent** ironman and you cannot de-iron.";
		if (permanent) {
			if (interaction) {
				await interaction.confirmation(
					'Would you like to change your ironman to a *permanent* iron? The only thing in your account that will change, is that you will no longer be able to de-iron. This is *permanent* and cannot be reversed.'
				);
			}
			await user.update({
				bitfield: {
					push: BitField.PermanentIronman
				}
			});
			return 'You are now a **permanent** Ironman, Enjoy!';
		}
		if (interaction) {
			await interaction.confirmation(
				'Would you like to stop being an ironman? You will keep all your items and stats but you will have to start over if you want to play as an ironman again.'
			);
		}
		await user.update({
			minion_ironman: false
		});
		return 'You are no longer an ironman.';
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
			creator_id: user.id,
			was_finalized: false
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
			'ge',
			'cancel'
		)}`;
	}

	if (interaction) {
		await interaction.confirmation(
			`Are you sure you want to start over and play as an ironman?

:warning: **Read the following text before confirming. This is your only warning. ** :warning:

The following things will be COMPLETELY reset/wiped from your account, with no chance of being recovered: Your entire bank, collection log, GP/Coins, QP/Quest Points, Clue Scores, Monster Scores, all XP. If you type \`confirm\`, they will all be wiped.

After becoming an ironman:
- You will no longer be able to receive GP from  \`+daily\`
- You will no longer be able to use \`+pay\`, \`+duel\`, \`+sellto\`, \`+sell\`, \`+dice\`
- You can de-iron at any time, and keep all your stuff acquired while playing as an ironman.`
		);
	}

	await user.sync();

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
		bank_bg_hex: user.user.bank_bg_hex,
		bank_sort_method: user.user.bank_sort_method,
		bank_sort_weightings: user.user.bank_sort_weightings as ItemBank,
		minion_bought_date: user.user.minion_bought_date,
		RSN: user.user.RSN,
		pets: user.user.pets as ItemBank,
		bitfield: bitFieldsToKeep.filter(i => user.bitfield.includes(i))
	};

	// Bingo
	await prisma.user.upsert({
		where: {
			id: DELETED_USER_ID
		},
		create: { id: DELETED_USER_ID },
		update: {}
	});
	await prisma.bingoParticipant.updateMany({ where: { user_id: user.id }, data: { user_id: DELETED_USER_ID } });
	await prisma.bingo.updateMany({ where: { creator_id: user.id }, data: { creator_id: DELETED_USER_ID } });

	// Delete tables with foreign keys first:
	await prisma.bingo.deleteMany({ where: { creator_id: user.id } });
	await prisma.historicalData.deleteMany({ where: { user_id: user.id } });
	await prisma.botItemSell.deleteMany({ where: { user_id: user.id } });
	await prisma.pinnedTrip.deleteMany({ where: { user_id: user.id } });
	await prisma.farmedCrop.deleteMany({ where: { user_id: user.id } });
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
	await prisma.buyCommandTransaction.deleteMany({ where: { user_id: BigInt(user.id) } });

	// Refund the leagues points they spent
	const roboChimpUser = await roboChimpUserFetch(user.id);
	if (roboChimpUser.leagues_points_total >= 0) {
		await roboChimpClient.user.upsert({
			where: {
				id: BigInt(user.id)
			},
			update: {
				leagues_points_balance_osb: roboChimpUser.leagues_points_balance_osb
			},
			create: {
				id: BigInt(user.id)
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
