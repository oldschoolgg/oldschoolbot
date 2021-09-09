import { Inhibitor, KlasaMessage } from 'klasa';

import { BadgesEnum, BitField, Channel, SupportServer } from '../lib/constants';
import { getGuildSettings } from '../lib/settings/settings';
import { GuildSettings } from '../lib/settings/types/GuildSettings';
import { UserSettings } from '../lib/settings/types/UserSettings';

export default class extends Inhibitor {
	async run(msg: KlasaMessage) {
		if (!msg.guild) return;
		// Allow green gem badge holders to run commands in support channel:
		if (
			msg.channel.id === Channel.HelpAndSupport &&
			msg.author.settings.get(UserSettings.Badges).includes(BadgesEnum.GreenGem)
		) {
			return;
		}

		// Allow contributors + moderators to use disabled channels in SupportServer
		const userBitfield = msg.author.settings.get(UserSettings.BitField);
		const isStaff = userBitfield.includes(BitField.isModerator) || userBitfield.includes(BitField.isContributor);
		if (msg.guild.id === SupportServer && isStaff) {
			return false;
		}

		// Allow guild-moderators to use commands in disabled channels
		const settings = await getGuildSettings(msg.guild!);
		if (settings.get(GuildSettings.StaffOnlyChannels).includes(msg.channel.id)) {
			const hasPerm = await msg.hasAtLeastPermissionLevel(6);
			if (!hasPerm) throw true;
		}
	}
}
