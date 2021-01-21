import { Channel, DMChannel, GuildChannel, Permissions, TextChannel } from 'discord.js';

const { ADD_REACTIONS, VIEW_CHANNEL, SEND_MESSAGES, EMBED_LINKS, ATTACH_FILES } = Permissions.FLAGS;

export function hasBasicChannelPerms(ch: Channel): ch is TextChannel {
	if ((!(ch instanceof DMChannel) && !(ch instanceof TextChannel)) || !ch.postable) {
		return false;
	}

	if (ch instanceof GuildChannel) {
		const chPerms = ch.permissionsFor(ch.client.user!);
		if (
			!chPerms ||
			[ADD_REACTIONS, VIEW_CHANNEL, SEND_MESSAGES, EMBED_LINKS, ATTACH_FILES].some(
				perm => !chPerms.has(perm)
			)
		) {
			return false;
		}
	}

	return true;
}
