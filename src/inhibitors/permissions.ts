import { Command, Inhibitor, KlasaMessage } from 'klasa';

import { GuildSettings } from '../lib/settings/types/GuildSettings';

export default class extends Inhibitor {
	async run(msg: KlasaMessage, command: Command) {
		const { broke, permission } = await this.client.permissionLevels.run(
			msg,
			command.permissionLevel
		);

		if (!permission) {
			const isStaff = await msg.hasAtLeastPermissionLevel(6);
			const channelDisabled =
				msg.guild &&
				msg.guild.settings.get(GuildSettings.StaffOnlyChannels).includes(msg.channel.id);

			if (!channelDisabled || (isStaff && channelDisabled)) {
				throw broke ? msg.language.get('INHIBITOR_PERMISSIONS') : true;
			}
			throw true;
		}
	}
}
