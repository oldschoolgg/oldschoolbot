import { Command, Inhibitor, KlasaMessage } from 'klasa';

import { Channel } from '../lib/constants';
import { GuildSettings } from '../lib/settings/types/GuildSettings';
import { UserSettings } from '../lib/settings/types/UserSettings';

export default class extends Inhibitor {
	async run(msg: KlasaMessage, cmd: Command) {
		if (!msg.guild) return;
		if (msg.channel.id === '855691390339121194' && cmd.name === 'tag') {
			return;
		}
		if (
			msg.guild &&
			[Channel.SupportChannel, '855691390339121194'].includes(msg.channel.id) &&
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
