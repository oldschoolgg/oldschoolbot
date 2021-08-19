import { CommandStore, KlasaMessage } from 'klasa';

import { PerkTier, TWEETS_RATELIMITING } from '../../lib/constants';
import { getGuildSettings } from '../../lib/settings/settings';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			subcommands: true,
			enabled: true,
			runIn: ['text'],
			usage: '<on|off>',
			permissionLevel: 7,
			description: 'Sends all reddit comments and posts made by OSRS Jmods to your channel.',
			examples: ['+jmodcomments on', '+jmodcomments off'],
			categoryFlags: ['settings']
		});
	}

	async on(msg: KlasaMessage) {
		if (msg.guild!.memberCount < 20 && getUsersPerkTier(msg.author) < PerkTier.Four) {
			return msg.channel.send(TWEETS_RATELIMITING);
		}
		const settings = await getGuildSettings(msg.guild!);
		if (settings.get(GuildSettings.JMODComments) === msg.channel.id) {
			return msg.channel.send('JMod Comments are already enabled in this channel.');
		}
		if (settings.get(GuildSettings.JMODComments) !== null) {
			await settings.update(GuildSettings.JMODComments, msg.channel.id);
			return msg.channel.send(
				"JMod Comments are already enabled in another channel, but I've switched them to use this channel."
			);
		}
		await settings.update(GuildSettings.JMODComments, msg.channel.id);
		return msg.channel.send('Enabled JMod Comments in this channel.');
	}

	async off(msg: KlasaMessage) {
		const settings = await getGuildSettings(msg.guild!);
		if (settings.get(GuildSettings.JMODComments) === null) {
			return msg.channel.send("JMod Comments aren't enabled, so you can't disable them.");
		}
		await settings.reset(GuildSettings.JMODComments);
		return msg.channel.send('Disabled JMod Comments in this channel.');
	}
}
