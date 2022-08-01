import { User } from '@prisma/client';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';

import { cancelTask, getActivityOfUser } from '../../../lib/settings/settings';
import { NexTaskOptions, RaidsOptions } from '../../../lib/types/minions';
import { newChatHeadImage } from '../../../lib/util/chatHeadImage';
import { minionName } from '../../../lib/util/minionUtils';
import { handleMahojiConfirmation } from '../../mahojiSettings';

export async function cancelTaskCommand(user: User, interaction?: SlashCommandInteraction) {
	const currentTask = getActivityOfUser(user.id);

	const mName = minionName(user);

	if (!currentTask) {
		return `${mName} isn't doing anything at the moment, so there's nothing to cancel.`;
	}

	if (currentTask.type === 'MonkeyRumble') {
		return {
			attachments: [
				{
					fileName: 'image.jpg',
					buffer: await newChatHeadImage({
						content: 'You no allowed to leave the arena! You finish fight!',
						head: 'marimbo'
					})
				}
			]
		};
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

	if (interaction) {
		await handleMahojiConfirmation(
			interaction,
			`${mName} is currently doing a ${currentTask.type} trip.
Please confirm if you want to call your minion back from their trip. 
They'll **drop** all their current **loot and supplies** to get back as fast as they can, so you won't receive any loot from this trip if you cancel it, and you will lose any supplies you spent to start this trip, if any.`
		);
	}

	await cancelTask(user.id);

	return `${mName}'s trip was cancelled, and they're now available.`;
}
