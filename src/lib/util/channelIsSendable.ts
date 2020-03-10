import { TextChannel, DMChannel, Channel } from 'discord.js';

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
