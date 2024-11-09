import type { ChatInputCommandInteraction } from 'discord.js';

import { formatDuration } from '@oldschoolgg/toolkit';
import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { cancelTask } from '../../../lib/settings/settings';
import type { ActivityTaskOptions, CancelOptions, NexTaskOptions, RaidsOptions } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { getActivityOfUser } from '../../../lib/util/minionIsBusy';

const nonRefundableTasks = ['Inferno', 'Cancel'];

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

	if (refund) {
		const data = currentTask as ActivityTaskOptions;
		if (!data.itemCost || data.itemCost.length === 0 || nonRefundableTasks.some(task => task === data.type)) {
			return 'You cannot be refunded for this trip!';
		}
	}

	const refundMessage = refund
		? ' They will return in 5 minutes with their supplies.'
		: " They'll **drop** all their current **loot and supplies** to get back as fast as they can, so you won't receive any loot from this trip if you cancel it, and you will lose any supplies you spent to start this trip, if any.";

	if (interaction) {
		await handleMahojiConfirmation(
			interaction,
			`${mName} is currently doing a ${currentTask.type} trip.
Please confirm if you want to call your minion back from their trip.${refundMessage}`
		);
	}

	if (refund) {
		const data = currentTask as ActivityTaskOptions;
		const duration = Time.Second * 300;
		await cancelTask(user.id);
		await addSubTaskToActivityTask<CancelOptions>({
			userID: user.id,
			duration: duration,
			channelID: channelID,
			refundItems: data.itemCost ? data.itemCost : new Bank(),
			type: 'Cancel'
		});
		return `${user.minionName} is returning from their trip with supplies, it'll take around ${formatDuration(
			duration
		)} to finish.`;
	}

	await cancelTask(user.id);
	return `${mName}'s trip was cancelled, and they're now available.`;
}

export const RefundTask: MinionTask = {
	type: 'Cancel',
	async run(data: CancelOptions) {
		const user = await mUserFetch(data.userID);
		await user.addItemsToBank({ items: data.refundItems });

		const str = `${user}, ${user.minionName}'s trip has been cancelled and they have returned with the following supplies: ${new Bank(data.refundItems).toString()}. They are now available.`;

		return handleTripFinish(user, data.channelID, str, undefined, data, null);
	}
};
