import { randomSnowflake } from '@oldschoolgg/toolkit';
import { UserError } from '@oldschoolgg/toolkit/dist/lib/UserError';

import { cancelUsersListings } from '../../mahoji/lib/abstracted_commands/cancelGEListingCommand';
import { prisma } from '../settings/prisma';
import { logError } from './logError';

export async function deleteUser(_source: string | MUser, options?: { robochimp?: boolean }) {
	const sourceUser = typeof _source === 'string' ? await mUserFetch(_source) : _source;

	try {
		await deleteBotUser(sourceUser);
		if (options?.robochimp) await deleteRobochimpUser(sourceUser);
	} catch (err: any) {
		throw err;
	} finally {
		// This regenerates a default users table row for the now-clean sourceUser
		await mUserFetch(sourceUser.id);
	}
	return true;
}
export async function deleteBotUser(userToDelete: MUser) {
	// First check for + cancel active GE Listings:
	await cancelUsersListings(userToDelete);

	const dummyUser = await mUserFetch(randomSnowflake());

	let transactions = [];
	transactions.push(prisma.$executeRaw`SET CONSTRAINTS ALL DEFERRED`);

	// Delete Queries
	// Slayer task must come before new_user since it's linked to new_users 500 IQ.
	transactions.push(prisma.slayerTask.deleteMany({ where: { user_id: userToDelete.id } }));

	transactions.push(prisma.newUser.deleteMany({ where: { id: userToDelete.id } }));

	transactions.push(prisma.gearPreset.deleteMany({ where: { user_id: userToDelete.id } }));
	transactions.push(prisma.botItemSell.deleteMany({ where: { user_id: userToDelete.id } }));
	transactions.push(prisma.historicalData.deleteMany({ where: { user_id: userToDelete.id } }));
	transactions.push(prisma.farmedCrop.deleteMany({ where: { user_id: userToDelete.id } }));
	transactions.push(prisma.minigame.deleteMany({ where: { user_id: userToDelete.id } }));
	transactions.push(prisma.playerOwnedHouse.deleteMany({ where: { user_id: userToDelete.id } }));
	transactions.push(prisma.pinnedTrip.deleteMany({ where: { user_id: userToDelete.id } }));
	transactions.push(prisma.reclaimableItem.deleteMany({ where: { user_id: userToDelete.id } }));

	transactions.push(prisma.activity.deleteMany({ where: { user_id: BigInt(userToDelete.id) } }));
	transactions.push(prisma.xPGain.deleteMany({ where: { user_id: BigInt(userToDelete.id) } }));
	transactions.push(prisma.lastManStandingGame.deleteMany({ where: { user_id: BigInt(userToDelete.id) } }));
	transactions.push(prisma.userStats.deleteMany({ where: { user_id: BigInt(userToDelete.id) } }));
	transactions.push(prisma.lootTrack.deleteMany({ where: { user_id: BigInt(userToDelete.id) } }));
	transactions.push(prisma.buyCommandTransaction.deleteMany({ where: { user_id: BigInt(userToDelete.id) } }));
	transactions.push(prisma.stashUnit.deleteMany({ where: { user_id: BigInt(userToDelete.id) } }));
	transactions.push(prisma.bingoParticipant.deleteMany({ where: { user_id: userToDelete.id } }));

	transactions.push(
		prisma.bingo.updateMany({ where: { creator_id: userToDelete.id }, data: { creator_id: dummyUser.id } })
	);

	// Without this, the user_id will be set to null when the Key'd users row is deleted:
	transactions.push(
		prisma.gEListing.updateMany({ where: { user_id: userToDelete.id }, data: { user_id: dummyUser.id } })
	);

	// Delete destUser.id user:
	transactions.push(prisma.user.deleteMany({ where: { id: userToDelete.id } }));

	// Preserve giveaway history
	transactions.push(
		prisma.giveaway.updateMany({ where: { user_id: userToDelete.id }, data: { user_id: dummyUser.id } })
	);

	// CommandUsage/EconomyTx aren't wiped on the destUser.id first, so we can preserve that data:
	transactions.push(
		prisma.commandUsage.updateMany({
			where: { user_id: BigInt(userToDelete.id) },
			data: { user_id: BigInt(dummyUser.id) }
		})
	);
	transactions.push(
		prisma.economyTransaction.updateMany({
			where: { sender: BigInt(userToDelete.id) },
			data: { sender: BigInt(dummyUser.id) }
		})
	);
	transactions.push(
		prisma.economyTransaction.updateMany({
			where: { recipient: BigInt(userToDelete.id) },
			data: { recipient: BigInt(dummyUser.id) }
		})
	);
	// GE Listing isn't wiped for destUser.id as that could mess up the GE
	transactions.push(
		prisma.gEListing.updateMany({ where: { user_id: userToDelete.id }, data: { user_id: dummyUser.id } })
	);

	// Update Users in group activities:
	const updateUsers = `UPDATE activity
	SET data = data::jsonb
		|| CONCAT('{"users":', REPLACE(data->>'users', '${userToDelete.id}', '${dummyUser.id}'),'}')::jsonb
		|| CONCAT('{"leader":"', REPLACE(data->>'leader', '${userToDelete.id}', '${dummyUser.id}'), '"}')::jsonb
	WHERE (data->'users')::jsonb ? '${userToDelete.id}'`;
	transactions.push(prisma.$queryRawUnsafe(updateUsers));

	// Update `detailedUsers` in ToA
	const updateToAUsers = `UPDATE activity SET data = data::jsonb || CONCAT('{"detailedUsers":', REPLACE(data->>'detailedUsers', '${userToDelete.id}', '${dummyUser.id}'),'}')::jsonb WHERE type = 'TombsOfAmascut' AND data->>'detailedUsers' LIKE '%${userToDelete.id}%'`;
	transactions.push(prisma.$queryRawUnsafe(updateToAUsers));

	transactions.push(
		prisma.migratedUsers.create({
			data: {
				source_id: userToDelete.id,
				dest_id: dummyUser.id,
				type: 'Deletion'
			}
		})
	);

	try {
		await prisma.$transaction(transactions);
	} catch (err: any) {
		logError(err);
		throw new UserError('Error deleting user. Sorry about that!');
	}
}

export async function deleteRobochimpUser(sourceUser: MUser) {
	const robochimpTx = [];
	robochimpTx.push(roboChimpClient.user.deleteMany({ where: { id: BigInt(sourceUser.id) } }));

	try {
		await roboChimpClient.$transaction(robochimpTx);
	} catch (err: any) {
		err.message += ' - User already migrated! Robochimp deletion failed!';
		logError(err);
		throw new UserError('Robochimp deletion failed, but minion data deleted already!');
	}
}
