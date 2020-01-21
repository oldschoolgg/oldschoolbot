const { Inhibitor } = require('klasa');

module.exports = class extends Inhibitor {
	async run(msg, command) {
		const { broke, permission } = await this.client.permissionLevels.run(
			msg,
			command.permissionLevel
		);

		if (!permission) {
			const isStaff = await msg.hasAtLeastPermissionLevel(6);
			const channelDisabled =
				msg.guild && msg.channel.settings.get('onlyStaffCanUseCommands');

			if (!channelDisabled || (isStaff && channelDisabled)) {
				throw broke ? msg.language.get('INHIBITOR_PERMISSIONS') : true;
			}
			throw true;
		}
	}
};
