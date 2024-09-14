import { Bank } from 'oldschooljs';

import { modifyBusyCounter } from '../busyCounterCache';

import { logError } from './logError';
import { userQueueFn } from './userQueues';

export async function tradePlayerItems(sender: MUser, recipient: MUser, _itemsToSend?: Bank, _itemsToReceive?: Bank) {
	if (recipient.isBusy) {
		return { success: false, message: `${recipient.usernameOrMention} is busy.` };
	}
	modifyBusyCounter(sender.id, 1);
	modifyBusyCounter(recipient.id, 1);

	const itemsToSend = _itemsToSend ? _itemsToSend.clone() : new Bank();
	const itemsToReceive = _itemsToReceive ? _itemsToReceive.clone() : new Bank();

	// Queue the primary trade function:
	return userQueueFn(sender.id, async () => {
		return userQueueFn(recipient.id, async () => {
			try {
				await Promise.all([sender.sync(), recipient.sync()]);
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
						bank: newSenderBank.toJSON()
					},
					where: {
						id: sender.id
					}
				});
				const updateRecipient = prisma.user.update({
					data: {
						GP: recipientGP,
						bank: newRecipientBank.toJSON()
					},
					where: {
						id: recipient.id
					}
				});
				// Run both in a single transaction, so it all succeeds or all fails:
				await prisma.$transaction([updateSender, updateRecipient]);
				await Promise.all([sender.sync(), recipient.sync()]);
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
				modifyBusyCounter(sender.id, -1);
				modifyBusyCounter(recipient.id, -1);
			}
		});
	});
}
