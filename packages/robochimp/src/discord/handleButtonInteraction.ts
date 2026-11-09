import type { ButtonMInteraction } from '@oldschoolgg/discord';

import { globalConfig } from '@/constants.js';
import { getBotShutdown, isBotService, setBotShutdown } from '@/lib/botControl.js';

export async function handleButtonInteraction(interaction: ButtonMInteraction) {
	const id = interaction.customId;
	if (!id) return;

	const member = await globalClient.fetchMember({
		guildId: globalConfig.supportServerID,
		userId: interaction.userId
	});
	if (!member) return;

	if (id.startsWith('chimp.stop_bot.cancel.')) {
		const bot = id.replace('chimp.stop_bot.cancel.', '');
		if (!isBotService(bot)) return;
		const user = await globalClient.fetchRUser(interaction.userId);
		if (!user.isMod() && !user.isAdmin()) {
			return interaction.reply({ content: 'Only moderators can cancel this shutdown.', ephemeral: true });
		}
		if (!(await getBotShutdown(bot))) {
			return interaction.reply({
				content: `There is no pending ${bot.toUpperCase()} shutdown.`,
				ephemeral: true
			});
		}
		await setBotShutdown(bot, false);
		return interaction.reply({ content: `Cancelled pending ${bot.toUpperCase()} shutdown.`, ephemeral: true });
	}

	if (id.includes('roles.')) {
		const roleID = id.split('_')[1];
		const pingableRole = await roboChimpClient.pingableRole.findFirst({
			where: {
				role_id: roleID
			}
		});
		if (!pingableRole) return;

		if (id.includes('add')) {
			if (member.roles.includes(pingableRole.role_id)) {
				return interaction.reply({ content: 'You already have this role.', ephemeral: true });
			}
			try {
				await globalClient.giveRole(globalConfig.supportServerID, interaction.userId, pingableRole.role_id);
				return interaction.reply({
					content: `Gave you the \`${pingableRole.name}\` role.`,
					ephemeral: true
				});
			} catch {
				return interaction.reply({
					content: 'An error occured trying to give you the role.',
					ephemeral: true
				});
			}
		} else {
			if (!member.roles.includes(pingableRole.role_id)) {
				return interaction.reply({ content: "You don't have this role.", ephemeral: true });
			}
			try {
				await globalClient.takeRole(globalConfig.supportServerID, interaction.userId, pingableRole.role_id);
				return interaction.reply({
					content: `Removed the \`${pingableRole.name}\` role from you.`,
					ephemeral: true
				});
			} catch {
				return interaction.reply({
					content: 'An error occured trying to remove the role.',
					ephemeral: true
				});
			}
		}
	}
}
