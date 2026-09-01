import { Time, UserError } from '@oldschoolgg/toolkit';

import { cancelUsersListings } from '@/mahoji/lib/abstracted_commands/cancelGEListingCommand.js';

const MIGRATE_USER_CANCELLED_RESPONSE = 'Migration cancelled.';

type MigrateUserOptions = {
	shouldCancel?: () => boolean;
	onBeforeMainTransaction?: () => Promise<void> | void;
	onMainTransactionComplete?: () => Promise<void> | void;
};

export async function migrateUser(
	_source: string | MUser,
	_dest: string | MUser,
	options: MigrateUserOptions = {}
): Promise<string | true> {
	const throwIfCancelled = () => {
		if (options.shouldCancel?.()) {
			throw new UserError(MIGRATE_USER_CANCELLED_RESPONSE);
		}
	};
	const deletedUserId = '456226577798135808';
	if (_source === deletedUserId || _dest === deletedUserId) {
		throw new UserError(
			`This is not a real user ID, it's the BS user ID that discord replaces deleted user's with, sorry. You need the real user ID to find your data.`
		);
	}
	const sourceUser = typeof _source === 'string' ? await mUserFetch(_source) : _source;
	const destUser = typeof _dest === 'string' ? await mUserFetch(_dest) : _dest;

	if (sourceUser.id === destUser.id) {
		throw new UserError('Destination user cannot be the same as the source!');
	}

	// First check for + cancel active GE Listings:
	await Promise.all([cancelUsersListings(sourceUser), cancelUsersListings(destUser)]);
	throwIfCancelled();
	await options.onBeforeMainTransaction?.();

	try {
		await prisma.$transaction(
			async transactionClient => {
				const tx = transactionClient as typeof prisma;
				const transactions = [];
				transactions.push(tx.$executeRaw`SET CONSTRAINTS ALL DEFERRED`);

				// Delete Queries
				transactions.push(tx.slayerTask.deleteMany({ where: { user_id: destUser.id } }));

				transactions.push(tx.gearPreset.deleteMany({ where: { user_id: destUser.id } }));
				transactions.push(tx.giveaway.deleteMany({ where: { user_id: destUser.id } }));
				transactions.push(tx.botItemSell.deleteMany({ where: { user_id: destUser.id } }));
				transactions.push(tx.historicalData.deleteMany({ where: { user_id: destUser.id } }));
				transactions.push(tx.farmedCrop.deleteMany({ where: { user_id: destUser.id } }));
				transactions.push(tx.minigame.deleteMany({ where: { user_id: destUser.id } }));
				transactions.push(tx.playerOwnedHouse.deleteMany({ where: { user_id: destUser.id } }));
				transactions.push(tx.pinnedTrip.deleteMany({ where: { user_id: destUser.id } }));
				transactions.push(tx.reclaimableItem.deleteMany({ where: { user_id: destUser.id } }));

				transactions.push(tx.activity.deleteMany({ where: { user_id: BigInt(destUser.id) } }));
				transactions.push(tx.xPGain.deleteMany({ where: { user_id: BigInt(destUser.id) } }));
				transactions.push(tx.lastManStandingGame.deleteMany({ where: { user_id: BigInt(destUser.id) } }));
				transactions.push(tx.userStats.deleteMany({ where: { user_id: BigInt(destUser.id) } }));
				transactions.push(tx.lootTrack.deleteMany({ where: { user_id: BigInt(destUser.id) } }));
				transactions.push(tx.buyCommandTransaction.deleteMany({ where: { user_id: BigInt(destUser.id) } }));
				transactions.push(tx.stashUnit.deleteMany({ where: { user_id: BigInt(destUser.id) } }));
				transactions.push(tx.bingoParticipant.deleteMany({ where: { user_id: destUser.id } }));

				// For tables that aren't deleted, we often have to convert from target => source first to avoid FK errors, or null
				transactions.push(
					tx.bingo.updateMany({ where: { creator_id: destUser.id }, data: { creator_id: sourceUser.id } })
				);

				// Without this, the user_id will be set to null when the Key'd users row is deleted:
				transactions.push(
					tx.gEListing.updateMany({ where: { user_id: destUser.id }, data: { user_id: sourceUser.id } })
				);

				// Delete destUser.id user:
				transactions.push(tx.user.deleteMany({ where: { id: destUser.id } }));

				// Update queries:
				transactions.push(tx.user.updateMany({ where: { id: sourceUser.id }, data: { id: destUser.id } }));

				transactions.push(
					tx.bingo.updateMany({ where: { creator_id: sourceUser.id }, data: { creator_id: destUser.id } })
				);
				transactions.push(
					tx.bingoParticipant.updateMany({
						where: { user_id: sourceUser.id },
						data: { user_id: destUser.id }
					})
				);

				transactions.push(
					tx.gearPreset.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
				);
				transactions.push(
					tx.giveaway.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
				);
				transactions.push(
					tx.minigame.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
				);
				transactions.push(
					tx.playerOwnedHouse.updateMany({
						where: { user_id: sourceUser.id },
						data: { user_id: destUser.id }
					})
				);
				transactions.push(
					tx.slayerTask.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
				);
				transactions.push(
					tx.farmedCrop.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
				);
				transactions.push(
					tx.botItemSell.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
				);
				transactions.push(
					tx.pinnedTrip.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
				);
				transactions.push(
					tx.historicalData.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
				);
				transactions.push(
					tx.reclaimableItem.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
				);

				transactions.push(
					tx.activity.updateMany({
						where: { user_id: BigInt(sourceUser.id) },
						data: { user_id: BigInt(destUser.id) }
					})
				);
				transactions.push(
					tx.xPGain.updateMany({
						where: { user_id: BigInt(sourceUser.id) },
						data: { user_id: BigInt(destUser.id) }
					})
				);
				transactions.push(
					tx.lastManStandingGame.updateMany({
						where: { user_id: BigInt(sourceUser.id) },
						data: { user_id: BigInt(destUser.id) }
					})
				);
				transactions.push(
					tx.userStats.updateMany({
						where: { user_id: BigInt(sourceUser.id) },
						data: { user_id: BigInt(destUser.id) }
					})
				);
				transactions.push(
					tx.lootTrack.updateMany({
						where: { user_id: BigInt(sourceUser.id) },
						data: { user_id: BigInt(destUser.id) }
					})
				);
				transactions.push(
					tx.buyCommandTransaction.updateMany({
						where: { user_id: BigInt(sourceUser.id) },
						data: { user_id: BigInt(destUser.id) }
					})
				);
				transactions.push(
					tx.stashUnit.updateMany({
						where: { user_id: BigInt(sourceUser.id) },
						data: { user_id: BigInt(destUser.id) }
					})
				);

				// CommandUsage/EconomyTx aren't wiped on the destUser.id first, so we can preserve that data:
				transactions.push(
					tx.commandUsage.updateMany({
						where: { user_id: BigInt(sourceUser.id) },
						data: { user_id: BigInt(destUser.id) }
					})
				);
				transactions.push(
					tx.economyTransaction.updateMany({
						where: { sender: BigInt(sourceUser.id) },
						data: { sender: BigInt(destUser.id) }
					})
				);
				transactions.push(
					tx.economyTransaction.updateMany({
						where: { recipient: BigInt(sourceUser.id) },
						data: { recipient: BigInt(destUser.id) }
					})
				);
				// GE Listing isn't wiped for destUser.id as that could mess up the GE
				transactions.push(
					tx.gEListing.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
				);

				// Update Users in group activities:
				const updateUsers = `UPDATE activity
	SET data = data::jsonb
		|| CONCAT('{"users":', REPLACE(data->>'users', '${sourceUser.id}', '${destUser.id}'),'}')::jsonb
		|| CONCAT('{"leader":"', REPLACE(data->>'leader', '${sourceUser.id}', '${destUser.id}'), '"}')::jsonb
	WHERE (data->'users')::jsonb ? '${sourceUser.id}'`;
				transactions.push(tx.$queryRawUnsafe(updateUsers));

				for (const transaction of transactions) {
					throwIfCancelled();
					await transaction;
				}
				throwIfCancelled();
			},
			{
				timeout: Time.Minute * 30
			}
		);
	} catch (err: unknown) {
		if (err instanceof UserError && err.message === MIGRATE_USER_CANCELLED_RESPONSE) {
			return MIGRATE_USER_CANCELLED_RESPONSE;
		}
		Logging.logError(err as Error);
		throw new UserError('Error migrating user. Sorry about that!');
	}
	try {
		await options.onMainTransactionComplete?.();
	} catch (err) {
		Logging.logError(err as Error);
	}

	const roboChimpTarget = await roboChimpClient.user.findFirst({
		select: { migrated_user_id: true },
		where: { id: BigInt(destUser.id) }
	});
	if (!roboChimpTarget || roboChimpTarget.migrated_user_id !== BigInt(sourceUser.id)) {
		// Only migrate robochimp data if it's not already been migrated:
		const robochimpTx = [];
		robochimpTx.push(roboChimpClient.user.deleteMany({ where: { id: BigInt(destUser.id) } }));
		robochimpTx.push(
			roboChimpClient.user.updateMany({
				where: { id: BigInt(sourceUser.id) },
				data: { id: BigInt(destUser.id) }
			})
		);
		// Set the migrated_user_id value to prevent duplicate robochimp migrations.
		robochimpTx.push(
			roboChimpClient.user.updateMany({
				where: { id: BigInt(destUser.id) },
				data: { migrated_user_id: BigInt(sourceUser.id) }
			})
		);
		try {
			await roboChimpClient.$transaction(robochimpTx);
		} catch (_err: unknown) {
			const err = _err as Error;
			err.message += ' - User already migrated! Robochimp migration failed!';
			Logging.logError(err);
			throw new UserError('Robochimp migration failed, but minion data migrated already!');
		}
	}

	// This regenerates a default users table row for the now-clean sourceUser
	await mUserFetch(sourceUser.id);

	return true;
}
