import { UserError } from '@oldschoolgg/toolkit/structures';
import { cancelUsersListings } from '../../mahoji/lib/abstracted_commands/cancelGEListingCommand';

import { logError } from './logError';

export async function migrateUser(_source: string | MUser, _dest: string | MUser): Promise<string | true> {
	const sourceUser = typeof _source === 'string' ? await mUserFetch(_source) : _source;
	const destUser = typeof _dest === 'string' ? await mUserFetch(_dest) : _dest;

	if (sourceUser.id === destUser.id) {
		throw new UserError('Destination user cannot be the same as the source!');
	}

	// First check for + cancel active GE Listings:
	await Promise.all([cancelUsersListings(sourceUser), cancelUsersListings(destUser)]);

	const transactions = [];
	transactions.push(prisma.$executeRaw`SET CONSTRAINTS ALL DEFERRED`);

	// Delete Queries
	// Slayer task must come before new_user since it's linked to new_users 500 IQ.
	transactions.push(prisma.slayerTask.deleteMany({ where: { user_id: destUser.id } }));

	transactions.push(prisma.newUser.deleteMany({ where: { id: destUser.id } }));

	transactions.push(prisma.gearPreset.deleteMany({ where: { user_id: destUser.id } }));
	transactions.push(prisma.giveaway.deleteMany({ where: { user_id: destUser.id } }));
	transactions.push(prisma.botItemSell.deleteMany({ where: { user_id: destUser.id } }));
	transactions.push(prisma.historicalData.deleteMany({ where: { user_id: destUser.id } }));
	transactions.push(prisma.farmedCrop.deleteMany({ where: { user_id: destUser.id } }));
	transactions.push(prisma.minigame.deleteMany({ where: { user_id: destUser.id } }));
	transactions.push(prisma.playerOwnedHouse.deleteMany({ where: { user_id: destUser.id } }));
	transactions.push(prisma.pinnedTrip.deleteMany({ where: { user_id: destUser.id } }));
	transactions.push(prisma.reclaimableItem.deleteMany({ where: { user_id: destUser.id } }));

	transactions.push(prisma.activity.deleteMany({ where: { user_id: BigInt(destUser.id) } }));
	transactions.push(prisma.xPGain.deleteMany({ where: { user_id: BigInt(destUser.id) } }));
	transactions.push(prisma.lastManStandingGame.deleteMany({ where: { user_id: BigInt(destUser.id) } }));
	transactions.push(prisma.userStats.deleteMany({ where: { user_id: BigInt(destUser.id) } }));
	transactions.push(prisma.lootTrack.deleteMany({ where: { user_id: BigInt(destUser.id) } }));
	transactions.push(prisma.buyCommandTransaction.deleteMany({ where: { user_id: BigInt(destUser.id) } }));
	transactions.push(prisma.stashUnit.deleteMany({ where: { user_id: BigInt(destUser.id) } }));
	transactions.push(prisma.bingoParticipant.deleteMany({ where: { user_id: destUser.id } }));

	// For tables that aren't deleted, we often have to convert from target => source first to avoid FK errors, or null
	transactions.push(
		prisma.bingo.updateMany({ where: { creator_id: destUser.id }, data: { creator_id: sourceUser.id } })
	);

	// Without this, the user_id will be set to null when the Key'd users row is deleted:
	transactions.push(
		prisma.gEListing.updateMany({ where: { user_id: destUser.id }, data: { user_id: sourceUser.id } })
	);

	// Delete destUser.id user:
	transactions.push(prisma.user.deleteMany({ where: { id: destUser.id } }));

	// Update queries:
	transactions.push(prisma.user.updateMany({ where: { id: sourceUser.id }, data: { id: destUser.id } }));
	transactions.push(prisma.newUser.updateMany({ where: { id: sourceUser.id }, data: { id: destUser.id } }));

	transactions.push(
		prisma.bingo.updateMany({ where: { creator_id: sourceUser.id }, data: { creator_id: destUser.id } })
	);
	transactions.push(
		prisma.bingoParticipant.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
	);

	transactions.push(
		prisma.gearPreset.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
	);
	transactions.push(
		prisma.giveaway.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
	);
	transactions.push(
		prisma.minigame.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
	);
	transactions.push(
		prisma.playerOwnedHouse.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
	);
	transactions.push(
		prisma.slayerTask.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
	);
	transactions.push(
		prisma.farmedCrop.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
	);
	transactions.push(
		prisma.botItemSell.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
	);
	transactions.push(
		prisma.pinnedTrip.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
	);
	transactions.push(
		prisma.historicalData.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
	);
	transactions.push(
		prisma.reclaimableItem.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
	);

	transactions.push(
		prisma.activity.updateMany({
			where: { user_id: BigInt(sourceUser.id) },
			data: { user_id: BigInt(destUser.id) }
		})
	);
	transactions.push(
		prisma.xPGain.updateMany({ where: { user_id: BigInt(sourceUser.id) }, data: { user_id: BigInt(destUser.id) } })
	);
	transactions.push(
		prisma.lastManStandingGame.updateMany({
			where: { user_id: BigInt(sourceUser.id) },
			data: { user_id: BigInt(destUser.id) }
		})
	);
	transactions.push(
		prisma.userStats.updateMany({
			where: { user_id: BigInt(sourceUser.id) },
			data: { user_id: BigInt(destUser.id) }
		})
	);
	transactions.push(
		prisma.lootTrack.updateMany({
			where: { user_id: BigInt(sourceUser.id) },
			data: { user_id: BigInt(destUser.id) }
		})
	);
	transactions.push(
		prisma.buyCommandTransaction.updateMany({
			where: { user_id: BigInt(sourceUser.id) },
			data: { user_id: BigInt(destUser.id) }
		})
	);
	transactions.push(
		prisma.stashUnit.updateMany({
			where: { user_id: BigInt(sourceUser.id) },
			data: { user_id: BigInt(destUser.id) }
		})
	);

	// CommandUsage/EconomyTx aren't wiped on the destUser.id first, so we can preserve that data:
	transactions.push(
		prisma.commandUsage.updateMany({
			where: { user_id: BigInt(sourceUser.id) },
			data: { user_id: BigInt(destUser.id) }
		})
	);
	transactions.push(
		prisma.economyTransaction.updateMany({
			where: { sender: BigInt(sourceUser.id) },
			data: { sender: BigInt(destUser.id) }
		})
	);
	transactions.push(
		prisma.economyTransaction.updateMany({
			where: { recipient: BigInt(sourceUser.id) },
			data: { recipient: BigInt(destUser.id) }
		})
	);
	// GE Listing isn't wiped for destUser.id as that could mess up the GE
	transactions.push(
		prisma.gEListing.updateMany({ where: { user_id: sourceUser.id }, data: { user_id: destUser.id } })
	);

	// Update Users in group activities:
	const updateUsers = `UPDATE activity
	SET data = data::jsonb
		|| CONCAT('{"users":', REPLACE(data->>'users', '${sourceUser.id}', '${destUser.id}'),'}')::jsonb
		|| CONCAT('{"leader":"', REPLACE(data->>'leader', '${sourceUser.id}', '${destUser.id}'), '"}')::jsonb
	WHERE (data->'users')::jsonb ? '${sourceUser.id}'`;
	transactions.push(prisma.$queryRawUnsafe(updateUsers));

	// Update `detailedUsers` in ToA
	const updateToAUsers = `UPDATE activity SET data = data::jsonb || CONCAT('{"detailedUsers":', REPLACE(data->>'detailedUsers', '${sourceUser.id}', '${destUser.id}'),'}')::jsonb WHERE type = 'TombsOfAmascut' AND data->>'detailedUsers' LIKE '%${sourceUser.id}%'`;
	transactions.push(prisma.$queryRawUnsafe(updateToAUsers));

	try {
		await prisma.$transaction(transactions);
	} catch (err: any) {
		logError(err);
		throw new UserError('Error migrating user. Sorry about that!');
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
		} catch (err: any) {
			err.message += ' - User already migrated! Robochimp migration failed!';
			logError(err);
			throw new UserError('Robochimp migration failed, but minion data migrated already!');
		}
	}

	// This regenerates a default users table row for the now-clean sourceUser
	await mUserFetch(sourceUser.id);

	return true;
}
