import { ButtonBuilder, ButtonStyle, InteractionID } from '@oldschoolgg/discord';
import type { ItemBank } from 'oldschooljs';

import { Prisma } from '@/prisma/main.js';
import { BitField, DELETED_USER_ID } from '@/lib/constants.js';
import { assert } from '@/lib/util/logError.js';

async function ensureDeletedUserExists() {
	try {
		const result = await prisma.user.upsert({
			where: {
				id: DELETED_USER_ID
			},
			create: {
				id: DELETED_USER_ID
			},
			update: {}
		});
		return result;
	} catch (err) {
		// Ignore unique constraint errors, they already have a row
		if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== 'P2002') {
			throw err;
		}
	}
}

export async function ironmanCommand(user: MUser, interaction: MInteraction | null, deleteAccount?: string) {
	if (deleteAccount !== undefined && deleteAccount !== 'CONFIRM!')
		return 'To delete your account, enter exactly `CONFIRM!`.';
	if (deleteAccount !== undefined && !user.isIronman) return 'Only ironman accounts can be deleted this way.';
	if (deleteAccount !== undefined && !interaction) return 'Account deletion requires an interaction.';
	if (await user.minionIsBusy()) return 'Your minion is busy.';

	if (user.isIronman && deleteAccount === undefined) {
		return 'You are already an ironman. To start over as a non-ironman, use `delete_account: CONFIRM!` to permanently wipe your BSO account.';
	}

	const existingGiveaways = await prisma.giveaway.findMany({
		where: {
			user_id: user.id,
			completed: false
		}
	});

	if (existingGiveaways.length !== 0) {
		return `You can't ${deleteAccount !== undefined ? 'delete your account' : 'become an ironman'} because you have active giveaways.`;
	}

	const bingos = await prisma.bingo.count({
		where: {
			creator_id: user.id,
			was_finalized: false
		}
	});

	if (bingos !== 0) {
		return `You can't ${deleteAccount !== undefined ? 'delete your account' : 'become an ironman'} because you have active bingos.`;
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
		return `You can't ${deleteAccount !== undefined ? 'delete your account' : 'become an ironman'} because you have active Grand Exchange listings. Cancel them and try again: ${globalClient.mentionCommand(
			'ge',
			'cancel'
		)}`;
	}

	if (deleteAccount !== undefined && interaction) {
		const buttons = () => [
			new ButtonBuilder()
				.setCustomId(InteractionID.CONFIRM)
				.setLabel('Delete my account')
				.setStyle(ButtonStyle.Danger),
			new ButtonBuilder()
				.setCustomId(InteractionID.CANCEL)
				.setLabel('Keep my account')
				.setStyle(ButtonStyle.Secondary)
		];
		await interaction.confirmation(
			'**ACCOUNT DELETION - FIRST WARNING:** This permanently wipes your BSO account to remove ironman status: your bank, items, XP, stats, progress and minion will be gone. Command usage, shared transaction/history records and shared account entitlements remain. You will start again from scratch. Death is usually safer than this.',
			{ buttons: buttons() }
		);
		await interaction.confirmation(
			'**FINAL WARNING: DELETE YOUR BSO ACCOUNT?** Your ironman progress and possessions will be permanently destroyed, and you will start as a fresh non-iron account. There is no banker waiting to hand your stuff back.',
			{ buttons: buttons(), swap: true }
		);
		await deleteIronmanAccount(user);
		return 'Your BSO account was deleted. You can start over as a non-ironman.';
	}

	if (interaction) {
		await interaction.confirmation(
			`Are you sure you want to start over and play as an ironman?
:warning: **Read the following text before confirming. This is your only warning. ** :warning:
The following things will be COMPLETELY reset/wiped from your account, with no chance of being recovered: Your entire bank, collection log, GP/Coins, QP/Quest Points, Clue Scores, Monster Scores, all XP. If you type \`confirm\`, they will all be wiped.
After becoming an ironman:
	- You will no longer be able to receive GP from  \`/daily\`
	- You will no longer be able to use \`/pay\`, \`/duel\`, \`/sellto\`, \`/sell\`, \`/dice\`, \`/gamble give_random_item\`
	- To de-iron, you must permanently delete your entire BSO account and start over.
    - Your entire BSO account, EVERYTHING, will be reset.
Type \`confirm permanent ironman\` if you understand the above information, and want to become an ironman now.`
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
		BitField.PatronTier1,
		BitField.PatronTier2,
		BitField.PatronTier3,
		BitField.PatronTier4,
		BitField.PatronTier5,
		BitField.Moderator,
		BitField.BypassAgeRestriction,
		BitField.HasPermanentEventBackgrounds,
		BitField.HasPermanentTierOne,
		BitField.DisabledRandomEvents,
		BitField.AlwaysSmallBank,
		BitField.PatronTier6
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

	// Ensure deleted user exists
	await ensureDeletedUserExists();
	await prisma.bingoParticipant.deleteMany({ where: { user_id: user.id } });
	await prisma.bingo.updateMany({ where: { creator_id: user.id }, data: { creator_id: DELETED_USER_ID } });

	// Delete tables with foreign keys first:
	await prisma.bingo.deleteMany({ where: { creator_id: user.id } });
	await prisma.historicalData.deleteMany({ where: { user_id: user.id } });
	await prisma.botItemSell.deleteMany({ where: { user_id: user.id } });
	await prisma.pinnedTrip.deleteMany({ where: { user_id: user.id } });
	await prisma.farmedCrop.deleteMany({ where: { user_id: user.id } });
	await prisma.portent.deleteMany({ where: { user_id: user.id } });
	await prisma.minigame.deleteMany({ where: { user_id: user.id } });
	await prisma.slayerTask.deleteMany({ where: { user_id: user.id } });

	await prisma.gearPreset.deleteMany({ where: { user_id: user.id } });
	await prisma.reclaimableItem.deleteMany({ where: { user_id: user.id } });
	await prisma.tableBank.deleteMany({ where: { user_id: user.id } });
	await prisma.shootingStars.deleteMany({ where: { user_id: user.id } });
	await prisma.lootTrack.deleteMany({ where: { user_id: BigInt(user.id) } });
	await prisma.lastManStandingGame.deleteMany({ where: { user_id: BigInt(user.id) } });
	await prisma.halloweenEvent.deleteMany({ where: { user_id: user.id } });
	await prisma.archonEvent.deleteMany({ where: { user_id: user.id } });
	// Now we can delete the user
	await prisma.user.deleteMany({
		where: { id: user.id }
	});
	await prisma.user.create({
		data: createOptions
	});
	await prisma.playerOwnedHouse.deleteMany({ where: { user_id: user.id } });
	await prisma.xPGain.deleteMany({ where: { user_id: BigInt(user.id) } });
	await prisma.activity.deleteMany({ where: { user_id: BigInt(user.id) } });
	await prisma.stashUnit.deleteMany({ where: { user_id: BigInt(user.id) } });
	await prisma.userEvent.deleteMany({ where: { user_id: user.id } });
	await prisma.userStats.deleteMany({ where: { user_id: BigInt(user.id) } });
	await prisma.tameActivity.deleteMany({ where: { user_id: user.id } });
	await prisma.tame.deleteMany({ where: { user_id: user.id } });
	await prisma.fishingContestCatch.deleteMany({ where: { user_id: BigInt(user.id) } });
	await prisma.buyCommandTransaction.deleteMany({ where: { user_id: BigInt(user.id) } });
	await prisma.userCounter.deleteMany({ where: { user_id: BigInt(user.id) } });
	await prisma.jsonBank.deleteMany({ where: { user_id: user.id } });

	// Refund the leagues points they spent
	const roboChimpUser = await Cache.getRoboChimpUser(user.id);
	if (roboChimpUser.leagues_points_total >= 0) {
		await roboChimpClient.user.update({
			where: {
				id: BigInt(user.id)
			},
			data: {
				leagues_points_balance_bso: roboChimpUser.leagues_points_total
			}
		});
	}

	await user.update({
		minion_ironman: true,
		minion_hasBought: true
	});
	assert(
		!user.user.GP && !user.user.QP && !user.user.skills_woodcutting,
		`Ironman sanity check - ID: ${user.user.id}`
	);
	return 'You are now an ironman.';
}

async function deleteIronmanAccount(user: MUser) {
	await ensureDeletedUserExists();
	const id = user.id;
	const bigId = BigInt(id);
	await prisma.$transaction([
		prisma.bingoParticipant.deleteMany({ where: { user_id: id } }),
		prisma.bingo.updateMany({ where: { creator_id: id }, data: { creator_id: DELETED_USER_ID } }),
		prisma.gEListing.updateMany({ where: { user_id: id }, data: { user_id: null } }),
		prisma.giftBox.updateMany({ where: { creator_id: id }, data: { creator_id: null } }),
		prisma.giftBox.updateMany({ where: { owner_id: id }, data: { owner_id: null } }),
		prisma.gearPreset.deleteMany({ where: { user_id: id } }),
		prisma.giveaway.deleteMany({ where: { user_id: id } }),
		prisma.pinnedTrip.deleteMany({ where: { user_id: id } }),
		prisma.slayerTask.deleteMany({ where: { user_id: id } }),
		prisma.farmedCrop.deleteMany({ where: { user_id: id } }),
		prisma.botItemSell.deleteMany({ where: { user_id: id } }),
		prisma.portent.deleteMany({ where: { user_id: id } }),
		prisma.tameActivity.deleteMany({ where: { user_id: id } }),
		prisma.tame.deleteMany({ where: { user_id: id } }),
		prisma.playerOwnedHouse.deleteMany({ where: { user_id: id } }),
		prisma.reclaimableItem.deleteMany({ where: { user_id: id } }),
		prisma.tableBank.deleteMany({ where: { user_id: id } }),
		prisma.jsonBank.deleteMany({ where: { user_id: id } }),
		prisma.userEvent.deleteMany({ where: { user_id: id } }),
		prisma.halloweenEvent.deleteMany({ where: { user_id: id } }),
		prisma.archonEvent.deleteMany({ where: { user_id: id } }),
		prisma.shootingStars.deleteMany({ where: { user_id: id } }),
		prisma.mortimerTricks.deleteMany({ where: { OR: [{ trickster_id: id }, { target_id: id }] } }),
		prisma.activity.deleteMany({ where: { user_id: bigId } }),
		prisma.xPGain.deleteMany({ where: { user_id: bigId } }),
		prisma.stashUnit.deleteMany({ where: { user_id: bigId } }),
		prisma.userStats.deleteMany({ where: { user_id: bigId } }),
		prisma.lootTrack.deleteMany({ where: { user_id: bigId } }),
		prisma.lastManStandingGame.deleteMany({ where: { user_id: bigId } }),
		prisma.buyCommandTransaction.deleteMany({ where: { user_id: bigId } }),
		prisma.fishingContestCatch.deleteMany({ where: { user_id: bigId } }),
		prisma.userCounter.deleteMany({ where: { user_id: bigId } }),
		prisma.user.deleteMany({ where: { id } }),
		prisma.user.create({ data: { id } })
	]);
	await user.sync();
}
