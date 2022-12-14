import { Bank } from 'oldschooljs';

import { COINS_ID } from '../constants';
import { prisma } from '../settings/prisma';
import { logError } from './logError';
import { userQueueFn } from './userQueues';

const activeTradeCache = new Map();

function timeout(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export async function tradePlayerItems(sender: MUser, recipient: MUser, _itemsSent: Bank, _itemsReceived: Bank) {
	if (activeTradeCache.get(sender.id) || activeTradeCache.get(recipient.id)) {
		return { success: false, message: 'Only one trade per player can be active at a time!' };
	}
	activeTradeCache.set(sender.id, true);
	activeTradeCache.set(recipient.id, true);

	const itemsSent = _itemsSent.clone();
	const itemsReceived = _itemsReceived.clone();

	// Queue function for the recipient so no funny business / mistakes happen:
	userQueueFn(recipient.id, async () => {
		while (activeTradeCache.get(recipient.id)) {
			await timeout(500);
		}
	});
	// Queue the primary trade function: (Clears cache on completion/failure)
	return userQueueFn(sender.id, async () => {
		try {
			if (!sender.owns(itemsSent)) {
				return { success: false, message: `${sender.usernameOrMention} doesn't own all items.` };
			}
			if (!recipient.owns(itemsReceived)) {
				return { success: false, message: `${recipient.usernameOrMention} doesn't own all items.` };
			}
			const newSenderBank = sender.bank.clone();
			const newRecipientBank = recipient.bank.clone();

			let senderGP = sender.GP;
			let recipientGP = recipient.GP;

			if (itemsSent.has(COINS_ID)) {
				const sentCoins = itemsSent.amount(COINS_ID);
				senderGP -= sentCoins;
				itemsSent.remove(COINS_ID, sentCoins);
				recipientGP += sentCoins;
			}
			if (itemsReceived.has(COINS_ID)) {
				const rcvdCoins = itemsReceived.amount(COINS_ID);
				recipientGP -= rcvdCoins;
				itemsReceived.remove(COINS_ID, rcvdCoins);
				senderGP += rcvdCoins;
			}

			newSenderBank.remove(itemsSent);
			newRecipientBank.remove(itemsReceived);
			newSenderBank.add(itemsReceived);
			newRecipientBank.add(itemsSent);

			const updateSender = prisma.user.update({
				data: {
					GP: senderGP,
					bank: newSenderBank.bank
				},
				where: {
					id: sender.id
				}
			});
			const updateRecipient = prisma.user.update({
				data: {
					GP: recipientGP,
					bank: newRecipientBank.bank
				},
				where: {
					id: recipient.id
				}
			});
			// Run both in a single transaction, so it all succeeds or all fails:
			await prisma.$transaction([updateSender, updateRecipient]);
			return { success: true, message: null };
		} catch (e: any) {
			// We should only get here if something bad happened... most likely prisma, but possibly command competition
			logError(e, undefined, {
				sender: sender.id,
				recipient: recipient.id,
				command: 'trade',
				items_sent: itemsSent.toString(),
				items_received: itemsReceived.toString()
			});
			return { success: false, message: 'Temporary error, please try again.' };
		} finally {
			activeTradeCache.delete(sender.id);
			activeTradeCache.delete(recipient.id);
		}
	});
}
