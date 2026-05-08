import { ButtonBuilder, ButtonStyle, ChannelType } from '@oldschoolgg/discord';

import { globalConfig, MASS_HOSTER_ROLE_ID } from '../constants.js';

export const pingableRolesCommand = defineCommand({
	name: 'pingableroles',
	description: 'Oook ook ook!.',
	options: [
		{
			type: 'Subcommand',
			name: 'add',
			description: 'Add a pingable role.',
			options: [
				{
					type: 'Role',
					name: 'role',
					description: 'The role.',
					required: true
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'remove',
			description: 'Remove a pingable role.',
			options: [
				{
					type: 'Role',
					name: 'role',
					description: 'The role.',
					required: true
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'ping',
			description: 'Ping a role.',
			options: [
				{
					type: 'String',
					name: 'role',
					description: 'The role.',
					required: true,
					autocomplete: async ({ value }: StringAutoComplete) => {
						const roles = await roboChimpClient.pingableRole.findMany();
						return roles
							.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.name, value: i.name }));
					}
				}
			]
		}
	],
	run: async ({ options, user, guildId, channelId, member }) => {
		if (!guildId) return 'This command can only be used in a server.';
		if (options.ping) {
			if (!member) return 'No member found.';
			if (!member.roles.includes(MASS_HOSTER_ROLE_ID)) {
				return {
					content: "You don't have permission to ping roles. To ping roles, you need the mass hoster role.",
					ephemeral: true
				};
			}
			const role = await roboChimpClient.pingableRole.findFirst({
				where: { name: options.ping.role }
			});
			if (!role) return 'Invalid role.';
			const buttons: ButtonBuilder[] = [
				new ButtonBuilder()
					.setLabel('Give Me This Role')
					.setCustomId(`roles.add_${role.role_id}`)
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setLabel('Remove This Role From Me')
					.setCustomId(`roles.remove_${role.role_id}`)
					.setStyle(ButtonStyle.Secondary)
			];
			const channel = await globalClient.fetchChannel(channelId);
			if (!channel || channel.type !== ChannelType.GuildText) return 'Invalid channel.';

			globalClient.sendMessage(channel.id, {
				content: `<@&${role.role_id}> - you were pinged by ${user.mention}!`,
				allowedMentions: {
					roles: [role.role_id]
				},
				components: buttons
			});

			return {
				content: `You pinged the ${role.name} role. Please do not spam/abuse the pinging ability.`,
				ephemeral: true
			};
		}

		if (!user.isMod()) return { content: 'Ook OOK OOK', ephemeral: true };
		const inputRole = options.add?.role ?? options.remove?.role;
		if (!inputRole) return 'Invalid role.';
		const role = await globalClient.fetchRole(guildId, inputRole);
		if (!role || role.permissions.includes('ADMINISTRATOR') || role.permissions.includes('KICK_MEMBERS'))
			return 'Invalid role.';
		if (guildId !== globalConfig.supportServerID) return 'Invalid server.';

		const existingRole = await roboChimpClient.pingableRole.findFirst({
			where: { role_id: role.id }
		});

		if (options.add) {
			if (existingRole) return 'That is already a pingable role.';
			await roboChimpClient.pingableRole.create({
				data: {
					role_id: role.id,
					name: role.name
				}
			});
			return `Added ${role.name} as a pingable role.`;
		}
		if (options.remove) {
			if (!existingRole) return "That role doesn't exist.";
			await roboChimpClient.pingableRole.delete({
				where: {
					role_id: role.id
				}
			});
			return `Removed ${role.name} as a pingable role.`;
		}

		return 'Invalid command.';
	}
});
