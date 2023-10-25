import { UserError } from '@oldschoolgg/toolkit/dist/lib/UserError';
import { GEListing } from '@prisma/client';
import { ButtonBuilder, ButtonStyle } from 'discord.js';

import { cancelGEListingCommand } from '../mahoji/lib/abstracted_commands/cancelGEListingCommand';
import { prisma } from './settings/prisma';
import { itemNameFromID, toKMB } from './util';
import { logError } from './util/logError';

export function createGECancelButton(listing: GEListing) {
	const button = new ButtonBuilder()
		.setCustomId(`ge_cancel_${listing.userfacing_id}`)
		.setLabel(
			`Cancel ${listing.type} ${toKMB(listing.total_quantity)} ${itemNameFromID(listing.item_id)}`.slice(0, 79)
		)
		.setStyle(ButtonStyle.Secondary);

	return button;
}

export async function cancelUsersListings(user: MUser) {
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
	if (activeListings.length === 0) {
		return true;
	}
	// Let's terminate all listings:
	for (const listing of activeListings) {
		const result = await cancelGEListingCommand(user, listing.userfacing_id);
		if (!result.startsWith('Successfully cancelled your listing')) {
			const err = `Failed to cancel ${user.usernameOrMention}'s listings: ${result}`;
			logError(new Error(err));
			throw new UserError(err);
		}
	}
	return true;
}
