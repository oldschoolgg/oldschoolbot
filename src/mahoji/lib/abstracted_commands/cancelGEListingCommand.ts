import { Bank } from 'oldschooljs';

import { GrandExchange } from '../../../lib/grandExchange';
import { prisma } from '../../../lib/settings/prisma';
import { makeTransactFromTableBankQueries } from '../../../lib/tableBank';
import { logError } from '../../../lib/util/logError';

export async function cancelGEListingCommand(user: MUser, idToCancel: string) {
	if (GrandExchange.locked) {
		return 'The Grand Exchange is currently closed, please try again later.';
	}
	return GrandExchange.queue.add(async () => {
		const listing = await prisma.gEListing.findFirst({
			where: {
				user_id: user.id,
				userfacing_id: idToCancel
			}
		});
		if (!listing) {
			return 'You do not have a listing with that ID.';
		}
		if (listing.fulfilled_at || listing.quantity_remaining === 0) {
			return 'You cannot cancel a listing that has already been fulfilled.';
		}
		if (listing.cancelled_at) {
			return 'You cannot cancel a listing that has already been cancelled.';
		}

		const refundBank = new Bank();
		if (listing.type === 'Buy') {
			refundBank.add('Coins', Number(listing.asking_price_per_item) * listing.quantity_remaining);
		} else {
			refundBank.add(listing.item_id, listing.quantity_remaining);
		}

		const geBank = await GrandExchange.fetchOwnedBank();
		if (!geBank.has(refundBank)) {
			const error = new Error(`GE doesn't have ${refundBank} to refund ${user.id}, listing ${listing.id}`);
			logError(error);
			await GrandExchange.lockGE(error.message);
			return 'Something went wrong, please try again later.';
		}

		await prisma.$transaction([
			prisma.gEListing.update({
				where: {
					id: listing.id
				},
				data: {
					cancelled_at: new Date()
				}
			}),
			...makeTransactFromTableBankQueries({ bankToRemove: refundBank })
		]);

		await user.addItemsToBank({
			items: refundBank,
			collectionLog: false,
			dontAddToTempCL: true
		});

		return `Successfully cancelled your listing, you have been refunded ${refundBank}.`;
	});
}
