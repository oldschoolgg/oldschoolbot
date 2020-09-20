import { Command, CommandStore, KlasaMessage } from 'klasa';

import OSRSStreamers from '../../../data/osrs_streamers';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			permissionLevel: 7,
			subcommands: true,
			aliases: ['tn'],
			runIn: ['text'],
			usage: '<list|on|off|add|remove> [streamer_name:str]',
			usageDelim: ' ',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async on(msg: KlasaMessage) {
		if (msg.guild!.settings.get(GuildSettings.TwitchNotifications.Channel) === msg.channel.id) {
			return msg.sendLocale('TN_ALREADY_ENABLED');
		}
		if (msg.guild!.settings.get(GuildSettings.TwitchNotifications.Channel) !== null) {
			await msg.guild!.settings.update(
				GuildSettings.TwitchNotifications.Channel,
				msg.channel
			);
			return msg.sendLocale('TN_ENABLED_OTHER');
		}
		await msg.guild!.settings.update(GuildSettings.TwitchNotifications.Channel, msg.channel);
		return msg.sendLocale('TN_ENABLED');
	}

	async off(msg: KlasaMessage) {
		if (msg.guild!.settings.get(GuildSettings.TwitchNotifications.Channel) === null) {
			return msg.sendLocale('TN_ARENT_ENABLED');
		}
		await msg.guild!.settings.reset(GuildSettings.TwitchNotifications.Channel);
		return msg.sendLocale('TN_DISABLED');
	}

	async add(msg: KlasaMessage, [name]: [string]) {
		if (!name) {
			return msg.sendLocale('TN_NO_STREAMER', [msg.guild!.settings.get('prefix')]);
		}
		if (!OSRSStreamers.includes(name.toLowerCase())) {
			return msg.sendLocale('TN_INVALID_STREAMER');
		}
		if (
			msg
				.guild!.settings.get(GuildSettings.TwitchNotifications.Streamers)
				.includes(name.toLowerCase())
		) {
			return msg.sendLocale('TN_ALREADY_ENABLED_STREAMER');
		}
		await msg.guild!.settings.update(
			GuildSettings.TwitchNotifications.Streamers,
			name.toLowerCase(),
			{
				arrayAction: 'add'
			}
		);
		return msg.sendLocale('TN_ADDED_STREAMER', [name]);
	}

	async remove(msg: KlasaMessage, [name]: [string]) {
		if (!name) {
			return msg.sendLocale('TN_NO_STREAMER_REMOVE', [msg.guild!.settings.get('prefix')]);
		}
		if (!OSRSStreamers.includes(name.toLowerCase())) {
			return msg.sendLocale('TN_INVALID_STREAMER');
		}
		if (
			!msg
				.guild!.settings.get(GuildSettings.TwitchNotifications.Streamers)
				.includes(name.toLowerCase())
		) {
			return msg.sendLocale('TN_NOT_ENABLED_STREAMER');
		}

		await msg.guild!.settings.update(
			GuildSettings.TwitchNotifications.Streamers,
			name.toLowerCase(),
			{
				arrayAction: 'remove'
			}
		);
		return msg.sendLocale('TN_REMOVE', [name]);
	}

	async list(msg: KlasaMessage) {
		if (msg.guild!.settings.get(GuildSettings.TwitchNotifications.Channel) === null) {
			return msg.sendLocale('TN_NOT_ENABLED');
		}
		if (msg.guild!.settings.get(GuildSettings.TwitchNotifications.Streamers).length === 0) {
			return msg.sendLocale('TN_NO_STREAMERS');
		}
		return msg.sendLocale(
			msg.guild!.settings.get(GuildSettings.TwitchNotifications.Streamers).join(', ')
		);
	}
}
