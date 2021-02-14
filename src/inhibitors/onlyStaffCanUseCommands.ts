import { Inhibitor, KlasaMessage } from 'klasa';

import { Channel, SupportServer } from '../lib/constants';
import { GuildSettings } from '../lib/settings/types/GuildSettings';
import { UserSettings } from '../lib/settings/types/UserSettings';

export default class extends Inhibitor {
	async run(msg: KlasaMessage) {
		if (!msg.guild) return;
		if (
			msg.guild &&
			msg.guild.id === SupportServer &&
			msg.channel.id === Channel.SupportChannel &&
			msg.author.settings.get(UserSettings.Badges).includes(5)
		) {
			return;
		}
		if (msg.guild.settings.get(GuildSettings.StaffOnlyChannels).includes(msg.channel.id)) {
			const hasPerm = await msg.hasAtLeastPermissionLevel(6);
			if (!hasPerm) throw true;
		}
	}
}
