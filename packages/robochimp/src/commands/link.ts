import { MessageFlags, userMention } from 'discord.js';

async function rawLinkAccount(firstUserID: string, secondUserID: string) {
	const firstUser = await globalClient.fetchUser(firstUserID);
	const secondUser = await globalClient.fetchUser(secondUserID);

	if (!firstUser || !secondUser) {
		return 'Invalid user.';
	}

	if (firstUser.id === secondUser.id) {
		return 'Cannot link the same user.';
	}

	if (firstUser.userGroupId !== null && secondUser.userGroupId !== null) {
		if (firstUser.userGroupId !== secondUser.userGroupId) {
			return 'Both users are already linked to different groups.';
		} else {
			return 'Both users are already linked to the same group.';
		}
	}

	const groupID: string =
		firstUser.userGroupId ?? secondUser.userGroupId ?? (await roboChimpClient.userGroup.create({ data: {} })).id;

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

export const linkCommand: RoboChimpCommand = {
	name: 'link',
	description: 'Link alt accounts.',
	options: [
		{
			type: 'User',
			name: 'first_user',
			description: 'The first account to connect.',
			required: true
		},
		{
			type: 'User',
			name: 'second_user',
			description: 'The second account to connect.',
			required: true
		}
	],
	run: async ({
		options,
		user
	}: CommandRunOptions<{
		first_user: MahojiUserOption;
		second_user: MahojiUserOption;
	}>) => {
		if (!user.isMod()) return { content: 'Ook OOK OOK', flags: MessageFlags.Ephemeral };
		return rawLinkAccount(options.first_user.user.id, options.second_user.user.id);
	}
};
