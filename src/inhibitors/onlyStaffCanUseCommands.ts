import { Inhibitor, KlasaMessage } from 'klasa';

export default class extends Inhibitor {
	async run(msg: KlasaMessage) {
		if (!msg.guild) return;
		if (msg.guild?.settings.get('staffOnlyChannels').includes(msg.channel.id)) {
			const hasPerm = await msg.hasAtLeastPermissionLevel(6);
			if (!hasPerm) throw true;
		}
	}
}
