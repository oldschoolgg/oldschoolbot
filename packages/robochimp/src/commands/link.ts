import type { CommandRunOptions, ICommand, MahojiUserOption } from '@oldschoolgg/toolkit/discord-util';
import { ApplicationCommandOptionType, MessageFlags, userMention } from 'discord.js';

import { Bits, fetchUser } from '../util.js';

async function rawLinkAccount(firstUserID: string, secondUserID: string) {
	const firstUser = await fetchUser(firstUserID);
	const secondUser = await fetchUser(secondUserID);

	if (!firstUser || !secondUser) {
		return 'Invalid user.';
	}

	if (firstUser.id === secondUser.id) {
		return 'Cannot link the same user.';
	}

	if (firstUser.user_group_id !== null && secondUser.user_group_id !== null) {
		if (firstUser.user_group_id !== secondUser.user_group_id) {
			return 'Both users are already linked to different groups.';
		} else {
			return 'Both users are already linked to the same group.';
		}
	}

	const groupID: string =
		firstUser.user_group_id ??
		secondUser.user_group_id ??
		(await roboChimpClient.userGroup.create({ data: {} })).id;

	await roboChimpClient.user.updateMany({
		where: {
			id: {
				in: [firstUser.id, secondUser.id].map(id => BigInt(id))
			}
		},
		data: {
			user_group_id: groupID
		}
	});

	const inGroup = await roboChimpClient.user.findMany({
		where: {
			user_group_id: groupID
		}
	});

	return `Successfully linked ${userMention(firstUser.id.toString())} and ${userMention(secondUser.id.toString())} to the same group. There are now ${inGroup.length} alts in the group.`;
}

export const linkCommand: ICommand = {
	name: 'link',
	description: 'Link alt accounts.',
	options: [
		{
			type: ApplicationCommandOptionType.User,
			name: 'first_user',
			description: 'The first account to connect.',
			required: true
		},
		{
			type: ApplicationCommandOptionType.User,
			name: 'second_user',
			description: 'The second account to connect.',
			required: true
		}
	],
	run: async ({
		options,
		userID
	}: CommandRunOptions<{
		first_user: MahojiUserOption;
		second_user: MahojiUserOption;
	}>) => {
		const dbUser = await fetchUser(userID);
		if (!dbUser.bits.includes(Bits.Mod)) return { content: 'Ook OOK OOK', flags: MessageFlags.Ephemeral };
		return rawLinkAccount(options.first_user.user.id, options.second_user.user.id);
	}
};
