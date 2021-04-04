import { CommandStore, KlasaMessage } from 'klasa';

import { PerkTier, TWEETS_RATELIMITING } from '../../lib/constants';
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
			return msg.send(TWEETS_RATELIMITING);
		}
		if (msg.guild!.settings.get(GuildSettings.JMODComments) === msg.channel.id) {
			return msg.send(`JMod Comments are already enabled in this channel.`);
		}
		if (msg.guild!.settings.get(GuildSettings.JMODComments) !== null) {
			await msg.guild!.settings.update(GuildSettings.JMODComments, msg.channel.id);
			return msg.send(
				`JMod Comments are already enabled in another channel, but I've switched them to use this channel.`
			);
		}
		await msg.guild!.settings.update(GuildSettings.JMODComments, msg.channel.id);
		return msg.send(`Enabled JMod Comments in this channel.`);
	}

	async off(msg: KlasaMessage) {
		if (msg.guild!.settings.get(GuildSettings.JMODComments) === null) {
			return msg.send("JMod Comments aren't enabled, so you can't disable them.");
		}
		await msg.guild!.settings.reset(GuildSettings.JMODComments);
		return msg.send('Disabled JMod Comments in this channel.');
	}
}
