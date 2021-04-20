import { Command, Inhibitor, KlasaMessage } from 'klasa';

import { BitField, PerkTier } from '../lib/constants';
import { UserSettings } from '../lib/settings/types/UserSettings';
import getUsersPerkTier from '../lib/util/getUsersPerkTier';

export default class extends Inhibitor {
	public async run(msg: KlasaMessage, command: Command) {
		if (!command.restrictedChannels || command.restrictedChannels.length === 0) return;
		const bitfield = msg.author.settings.get(UserSettings.BitField);
		if (
			getUsersPerkTier(msg.author) >= PerkTier.Six ||
			[BitField.isModerator, BitField.isContributor].some(bit => bitfield.includes(bit))
		) {
			return;
		}
		if (
			msg.guild &&
			msg.guild.id === '342983479501389826' &&
			!command.restrictedChannels.includes(msg.channel.id)
		) {
			throw `You cannot use this command outside of these channels: ${command.restrictedChannels
				.map(c => `<#${c}>`)
				.join(', ')}.`;
		}

		return false;
	}
}
