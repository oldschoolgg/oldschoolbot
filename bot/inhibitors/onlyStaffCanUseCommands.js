const { Inhibitor } = require('klasa');

module.exports = class extends Inhibitor {
	async run(msg) {
		if (!msg.guild) return;
		if (msg.channel.settings.get('onlyStaffCanUseCommands')) {
			const hasPerm = await msg.hasAtLeastPermissionLevel(6);
			if (!hasPerm) throw true;
		}
	}
};
