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
			runIn: ['text'],
			usage: '<on|off>',
			permissionLevel: 7,
			requiredPermissions: ['EMBED_LINKS'],
			categoryFlags: ['settings'],
			examples: ['+hcimdeaths on', '+hcimdeaths off'],
			description:
				'Allows you to receive tweets from HCIM Deaths to your channel, showing when high-ranked HCIMs die.'
		});
	}

	async on(msg: KlasaMessage) {
		const settings = await getGuildSettings(msg.guild!);
		if (msg.guild!.memberCount < 20 && getUsersPerkTier(msg.author) < PerkTier.Four) {
			return msg.channel.send(TWEETS_RATELIMITING);
		}
		if (settings.get(GuildSettings.HCIMDeaths) === msg.channel.id) {
			return msg.channel.send('HCIM Death Tweets are already enabled in this channel.');
		}
		if (settings.get(GuildSettings.HCIMDeaths)) {
			await settings.update(GuildSettings.HCIMDeaths, msg.channel);
			return msg.channel.send(
				"HCIM Death Tweets are already enabled in another channel, but I've switched them to use this channel."
			);
		}
		await settings.update(GuildSettings.HCIMDeaths, msg.channel);
		return msg.channel.send('Enabled HCIM Death Tweets in this channel.');
	}

	async off(msg: KlasaMessage) {
		const settings = await getGuildSettings(msg.guild!);
		if (!settings.get(GuildSettings.HCIMDeaths)) {
			return msg.channel.send("HCIM Death Tweets aren't enabled, so you can't disable them.");
		}
		await settings.reset(GuildSettings.HCIMDeaths);
		return msg.channel.send('Disabled HCIM Death Tweets in this channel.');
	}
}
