import type { ChatInputCommandInteraction } from 'discord.js';

import { formatDuration, mentionCommand } from '@oldschoolgg/toolkit';
import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { refundChargeBank } from '../../../lib/degradeableItems';
import { cancelTask } from '../../../lib/settings/settings';
import { ChargeBank } from '../../../lib/structures/Bank';
import type { ActivityTaskOptions, NexTaskOptions, RaidsOptions, RefundOptions } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { getActivityOfUser } from '../../../lib/util/minionIsBusy';

export async function cancelTaskCommand(
	user: MUser,
	channelID: string,
	interaction?: ChatInputCommandInteraction,
	refund?: boolean
): Promise<string> {
	const currentTask = getActivityOfUser(user.id);

	const mName = user.minionName;

	if (!currentTask) {
		return `${mName} isn't doing anything at the moment, so there's nothing to cancel.`;
	}

	if (currentTask.type === 'Inferno') {
		return `${mName} is in the Inferno, they can't leave now!`;
	}

	if (currentTask.type === 'GroupMonsterKilling') {
		return `${mName} is in a group PVM trip, their team wouldn't like it if they left!`;
	}

	if (currentTask.type === 'Nex') {
		const data = currentTask as NexTaskOptions;
		if (data.users.length > 1) {
			return `${mName} is fighting Nex with a team, they can't abandon the trip!`;
		}
	}

	if (currentTask.type === 'Raids' || currentTask.type === 'TheatreOfBlood') {
		const data = currentTask as RaidsOptions;
		if (data.users.length > 1) {
			return `${mName} is currently doing a raid, they cannot leave their team!`;
		}
	}

	if ((currentTask as any).users && (currentTask as any).users.length > 1) {
		return 'Your minion is on a group activity and cannot cancel!';
	}
	const { itemCost, chargeCost } = currentTask as ActivityTaskOptions;
	const cannotRefund =
		(!itemCost || itemCost.length === 0) && (!chargeCost || new ChargeBank(chargeCost).length() === 0);

	if (refund && cannotRefund) return 'You cannot be refunded for this trip!';

	const refundMessage = refund
		? ' They will return in 5 minutes with their supplies.'
		: " They'll **drop** all their current **loot and supplies** to get back as fast as they can, so you won't receive any loot from this trip if you cancel it, and you will lose any supplies you spent to start this trip, if any.";
	const couldRefundMessage = !(refund || cannotRefund)
		? ` Note: this trip **can be refunded** using ${mentionCommand(globalClient, 'minion', 'cancel_and_refund')}.`
		: '';

	if (interaction) {
		await handleMahojiConfirmation(
			interaction,
			`${mName} is currently doing a ${currentTask.type} trip.
Please confirm if you want to call your minion back from their trip.${refundMessage}${couldRefundMessage}`
		);
	}

	// given ~15s interaction timer, task might have finished by now
	if (!getActivityOfUser(user.id)) {
		return `${mName} isn't doing anything at the moment, so there's nothing to cancel.`;
	}

	if (refund) {
		const data = currentTask as ActivityTaskOptions;

		const duration = Time.Second * 300;
		await cancelTask(user.id);
		await addSubTaskToActivityTask<RefundOptions>({
			userID: user.id,
			duration: duration,
			channelID: channelID,
			refundItems: data.itemCost,
			refundCharges: data.chargeCost,
			type: 'Refund'
		});
		return `${user.minionName} is returning from their trip with supplies, it'll take around ${formatDuration(
			duration
		)} to finish.`;
	}

	await cancelTask(user.id);
	return `${mName}'s trip was cancelled, and they're now available.`;
}

export const RefundTask: MinionTask = {
	type: 'Refund',
	async run(data: RefundOptions) {
		const user = await mUserFetch(data.userID);
		let str = `${user}, ${user.minionName}'s trip has been cancelled, and they're now available. `;

		const items = new Bank(data.refundItems);
		const charges = new ChargeBank(data.refundCharges);

		if (data.refundItems && items.length > 0) {
			await user.addItemsToBank({ items: data.refundItems });
			str += `They have returned with the following supplies: ${items.toString()}. `;
		}

		if (data.refundCharges && charges.length() > 0) {
			const results = await refundChargeBank(user, charges);
			str += results.map(r => r.userMessage).join(' ');
		}

		return handleTripFinish(user, data.channelID, str, undefined, data, null);
	}
};
