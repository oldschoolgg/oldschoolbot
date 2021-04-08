import { CommandStore, KlasaMessage } from 'klasa';

import { PerkTier, TWEETS_RATELIMITING } from '../../lib/constants';
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
		if (msg.guild!.memberCount < 20 && getUsersPerkTier(msg.author) < PerkTier.Four) {
			return msg.send(TWEETS_RATELIMITING);
		}
		if (msg.guild!.settings.get(GuildSettings.HCIMDeaths) === msg.channel.id) {
			return msg.send(`HCIM Death Tweets are already enabled in this channel.`);
		}
		if (msg.guild!.settings.get(GuildSettings.HCIMDeaths)) {
			await msg.guild!.settings.update(GuildSettings.HCIMDeaths, msg.channel);
			return msg.send(
				`HCIM Death Tweets are already enabled in another channel, but I've switched them to use this channel.`
			);
		}
		await msg.guild!.settings.update(GuildSettings.HCIMDeaths, msg.channel);
		return msg.send(`Enabled HCIM Death Tweets in this channel.`);
	}

	async off(msg: KlasaMessage) {
		if (!msg.guild!.settings.get(GuildSettings.HCIMDeaths)) {
			return msg.send("HCIM Death Tweets aren't enabled, so you can't disable them.");
		}
		await msg.guild!.settings.reset(GuildSettings.HCIMDeaths);
		return msg.send('Disabled HCIM Death Tweets in this channel.');
	}
}
