import { Bank } from 'oldschooljs';

import { prisma } from '../settings/prisma';
import { logError } from './logError';
import { userQueueFn } from './userQueues';

export const activeTradeCache = new Map();

function timeout(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export async function tradePlayerItems(sender: MUser, recipient: MUser, _itemsToSend?: Bank, _itemsToReceive?: Bank) {
	if (activeTradeCache.get(sender.id) || activeTradeCache.get(recipient.id)) {
		return { success: false, message: 'Only one trade per player can be active at a time!' };
	}
	activeTradeCache.set(sender.id, true);
	activeTradeCache.set(recipient.id, true);

	const itemsToSend = _itemsToSend ? _itemsToSend.clone() : new Bank();
	const itemsToReceive = _itemsToReceive ? _itemsToReceive.clone() : new Bank();

	// Queue function for the recipient so no funny business / mistakes happen:
	userQueueFn(recipient.id, async () => {
		while (activeTradeCache.get(recipient.id)) {
			await timeout(100);
		}
	});
	// Queue the primary trade function: (Clears cache on completion/failure)
	return userQueueFn(sender.id, async () => {
		try {
			await sender.sync();
			await recipient.sync();
			if (!sender.owns(itemsToSend)) {
				return { success: false, message: `${sender.usernameOrMention} doesn't own all items.` };
			}
			if (!recipient.owns(itemsToReceive)) {
				return { success: false, message: `${recipient.usernameOrMention} doesn't own all items.` };
			}
			const newSenderBank = sender.bank.clone();
			const newRecipientBank = recipient.bank.clone();

			let senderGP = sender.GP;
			let recipientGP = recipient.GP;

			if (itemsToSend.has('Coins')) {
				const sentCoins = itemsToSend.amount('Coins');
				senderGP -= sentCoins;
				itemsToSend.remove('Coins', sentCoins);
				recipientGP += sentCoins;
			}
			if (itemsToReceive.has('Coins')) {
				const receivedCoins = itemsToReceive.amount('Coins');
				recipientGP -= receivedCoins;
				itemsToReceive.remove('Coins', receivedCoins);
				senderGP += receivedCoins;
			}

			newSenderBank.remove(itemsToSend);
			newRecipientBank.remove(itemsToReceive);
			newSenderBank.add(itemsToReceive);
			newRecipientBank.add(itemsToSend);

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
				items_sent: itemsToSend.toString(),
				items_received: itemsToReceive.toString()
			});
			return { success: false, message: 'Temporary error, please try again.' };
		} finally {
			activeTradeCache.delete(sender.id);
			activeTradeCache.delete(recipient.id);
		}
	});
}
