import { type Channel, type GuildTextBasedChannel, PermissionsBitField, type TextChannel, type User } from 'discord.js';

/**
 * Checks if the bot can send a message to a channel object.
 * @param channel The channel to check if the bot can send a message to.
 */
export function channelIsSendable(channel: Channel | undefined | null): channel is TextChannel {
	if (!channel) return false;
	if (!channel.isTextBased()) return false;
	if (channel.isDMBased()) return true;
	const permissions = channel.permissionsFor(channel.client.user!);
	if (!permissions) return false;
	return (
		permissions.has(PermissionsBitField.Flags.ViewChannel) &&
		permissions.has(PermissionsBitField.Flags.SendMessages)
	);
}

export function isGuildChannel(channel?: Channel): channel is GuildTextBasedChannel {
	return channel !== undefined && !channel.isDMBased() && Boolean(channel.guild);
}

export function discrimName(user: User) {
	return `${user.username}#${user.discriminator}`;
}
