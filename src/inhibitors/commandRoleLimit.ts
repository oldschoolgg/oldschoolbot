import { Inhibitor, KlasaMessage } from 'klasa';

import { PerkTier, SupportServer } from '../lib/constants';
import getUsersPerkTier from '../lib/util/getUsersPerkTier';

export default class extends Inhibitor {
	public async run(msg: KlasaMessage) {
		if (!msg.guild || msg.guild.id !== SupportServer) return;
		if (msg.channel.id !== '342983479501389826') return;

		const perkTier = getUsersPerkTier(msg.author);

		if (msg.member && perkTier >= PerkTier.Two) {
			return false;
		}

		return true;
	}
}
