const { Inhibitor } = require('klasa');

module.exports = class extends Inhibitor {
	async run(message, command) {
		const { broke, permission } = await this.client.permissionLevels.run(
			message,
			command.permissionLevel
		);

		if (!permission) {
			const isStaff = await message.hasAtLeastPermissionLevel(6);
			const channelDisabled = message.channel.settings.onlyStaffCanUseCommands;

			if (!channelDisabled || (isStaff && channelDisabled)) {
				throw broke ? message.language.get('INHIBITOR_PERMISSIONS') : true;
			}
			throw true;
		}
	}
};
