import { Channel, DMChannel, TextChannel } from 'discord.js';

/**
 * Checks if the bot can send a message to a channel object.
 * @param channel The channel to check if the bot can send a message to.
 */
export function channelIsSendable(channel: Channel | undefined): channel is TextChannel {
	if (
		!channel ||
		(!(channel instanceof DMChannel) && !(channel instanceof TextChannel)) ||
		!channel.postable
	) {
		return false;
	}

	return true;
}
