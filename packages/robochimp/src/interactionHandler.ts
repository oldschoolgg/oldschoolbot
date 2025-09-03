import type { Interaction } from 'discord.js';

import { fetchSupportServer } from './util.js';

export async function handleInteraction(interaction: Interaction) {
	if (!interaction.isButton()) return;
	const id = interaction.customId;

	const member = (await fetchSupportServer()).members.cache.get(interaction.user.id);
	if (!member) return;

	if (id.includes('roles.')) {
		const roleID = id.split('_')[1];
		const pingableRole = await roboChimpClient.pingableRole.findFirst({
			where: {
				role_id: roleID
			}
		});
		if (!pingableRole) return;

		if (id.includes('add')) {
			if (member.roles.cache.has(pingableRole.role_id)) {
				return interaction.reply({ content: 'You already have this role.', ephemeral: true });
			}
			try {
				await member.roles.add(pingableRole.role_id);
				return interaction.reply({ content: `Gave you the \`${pingableRole.name}\` role.`, ephemeral: true });
			} catch {
				return interaction.reply({ content: 'An error occured trying to give you the role.', ephemeral: true });
			}
		} else {
			if (!member.roles.cache.has(pingableRole.role_id)) {
				return interaction.reply({ content: "You don't have this role.", ephemeral: true });
			}
			try {
				await member.roles.remove(pingableRole.role_id);
				return interaction.reply({
					content: `Removed the \`${pingableRole.name}\` role from you.`,
					ephemeral: true
				});
			} catch {
				return interaction.reply({ content: 'An error occured trying to remove the role.', ephemeral: true });
			}
		}
	}
}
