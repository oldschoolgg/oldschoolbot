import type { Channel, GuildTextBasedChannel, TextChannel, User } from 'discord.js';

/* c8 ignore start */
/**
 * Checks if the bot can send a message to a channel object.
 * @param channel The channel to check if the bot can send a message to.
 */
export function channelIsSendable(channel: Channel | undefined | null): channel is TextChannel {
	if (!channel) return false;
	if (!channel.isTextBased()) return false;
	if (channel.isDMBased()) return true;
	const permissions = channel.permissionsFor(channel.client.user!);
	// biome-ignore lint/complexity/useOptionalChain: <explanation>
	return permissions !== null && permissions.has('ViewChannel') && permissions.has('SendMessages');
}

export function isGuildChannel(channel?: Channel): channel is GuildTextBasedChannel {
	return channel !== undefined && !channel.isDMBased() && Boolean(channel.guild);
}

export function discrimName(user: User) {
	return `${user.username}#${user.discriminator}`;
}
