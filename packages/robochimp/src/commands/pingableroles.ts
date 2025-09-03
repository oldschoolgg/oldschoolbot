import type { CommandRunOptions, ICommand } from '@oldschoolgg/toolkit/discord-util';
import {
	type APIButtonComponentWithCustomId,
	type APIRole,
	ApplicationCommandOptionType,
	ButtonStyle,
	ComponentType,
	MessageFlags,
	PermissionsBitField
} from 'discord.js';

import { MASS_HOSTER_ROLE_ID, globalConfig } from '../constants.js';
import { Bits, fetchUser, sendToChannelID } from '../util.js';

function logRole(str: string) {
	return sendToChannelID('665678499578904596', str);
}

export const pingableRolesCommand: ICommand = {
	name: 'pingableroles',
	description: 'Oook ook ook!.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'add',
			description: 'Add a pingable role.',
			options: [
				{
					type: ApplicationCommandOptionType.Role,
					name: 'role',
					description: 'The role.',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'remove',
			description: 'Remove a pingable role.',
			options: [
				{
					type: ApplicationCommandOptionType.Role,
					name: 'role',
					description: 'The role.',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'ping',
			description: 'Ping a role.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'role',
					description: 'The role.',
					required: true,
					autocomplete: async value => {
						const roles = await roboChimpClient.pingableRole.findMany();
						return roles
							.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.name, value: i.name }));
					}
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		user,
		guildID,
		channelID,
		member
	}: CommandRunOptions<{
		add?: { role: APIRole; reason: string };
		remove?: { role: APIRole };
		ping?: { role: string };
	}>) => {
		const dbUser = await fetchUser(userID);
		if (options.ping) {
			if (!member) return 'No member found.';

			const roles = Array.isArray(member.roles) ? member.roles : Array.from(member.roles.cache.keys());

			if (!roles.includes(MASS_HOSTER_ROLE_ID)) {
				return {
					content: "You don't have permission to ping roles. To ping roles, you need the mass hoster role.",
					flags: MessageFlags.Ephemeral
				};
			}
			const role = await roboChimpClient.pingableRole.findFirst({
				where: { name: options.ping.role }
			});
			if (!role) return 'Invalid role.';
			const buttons: APIButtonComponentWithCustomId[] = [
				{
					label: 'Give Me This Role',
					custom_id: `roles.add_${role.role_id}`,
					style: ButtonStyle.Secondary,
					type: ComponentType.Button
				},
				{
					label: 'Remove This Role From Me',
					custom_id: `roles.remove_${role.role_id}`,
					style: ButtonStyle.Secondary,
					type: ComponentType.Button
				}
			];
			const channel = djsClient.channels.cache.get(channelID.toString());
			if (!channel || !channel.isTextBased()) return 'Invalid channel.';

			sendToChannelID(channel.id, {
				content: `<@&${role.role_id.toString()}> - you were pinged by ${user.username}!`,
				allowedMentions: {
					roles: [role.role_id.toString()]
				},
				components: [
					{
						type: ComponentType.ActionRow,
						components: buttons
					}
				]
			});

			return {
				content: `You pinged the ${role.name} role. Please do not spam/abuse the pinging ability.`,
				flags: MessageFlags.Ephemeral
			};
		}

		if (!dbUser.bits.includes(Bits.Mod)) return { content: 'Ook OOK OOK', flags: MessageFlags.Ephemeral };
		const inputRole = options.add?.role ?? options.remove?.role;
		if (!inputRole) return 'Invalid role.';
		const perms = new PermissionsBitField(BigInt(inputRole.permissions));
		if (perms.has('Administrator') || perms.has('KickMembers')) return 'Invalid role.';
		if (guildID !== globalConfig.supportServerID) return 'Invalid server.';

		const { id } = inputRole;
		const existingRole = await roboChimpClient.pingableRole.findFirst({
			where: { role_id: id }
		});

		if (options.add) {
			if (existingRole) return 'That is already a pingable role.';
			await roboChimpClient.pingableRole.create({
				data: {
					role_id: id,
					name: inputRole.name
				}
			});
			logRole(`${inputRole.name} was added as a pingable role by ${user.username}.`);
			return `Added ${inputRole.name} as a pingable role.`;
		}
		if (options.remove) {
			if (!existingRole) return "That role doesn't exist.";
			await roboChimpClient.pingableRole.delete({
				where: {
					role_id: id
				}
			});
			logRole(`${inputRole.name} was removed as a pingable role by ${user.username}.`);
			return `Removed ${inputRole.name} as a pingable role.`;
		}

		return 'Invalid command.';
	}
};
