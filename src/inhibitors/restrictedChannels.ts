import { Time } from 'e';
import { Command, Inhibitor, KlasaMessage } from 'klasa';

import { BitField, PerkTier } from '../lib/constants';
import { UserSettings } from '../lib/settings/types/UserSettings';
import getUsersPerkTier from '../lib/util/getUsersPerkTier';

export default class extends Inhibitor {
	public async run(msg: KlasaMessage, command: Command) {
		if (2 > 1) return;
		if (!command.restrictedChannels || command.restrictedChannels.length === 0) return;
		const bitfield = msg.author.settings.get(UserSettings.BitField);
		if (
			getUsersPerkTier(msg.author) >= PerkTier.Six ||
			[BitField.isModerator, BitField.isContributor].some(bit => bitfield.includes(bit))
		) {
			return;
		}

		if (
			msg.guild?.id === '342983479501389826' &&
			!command.restrictedChannels.includes(msg.channel.id)
		) {
			throw `You cannot use this command outside of one these channels: ${command.restrictedChannels
				.map(c => `<#${c}>`)
				.join(', ')}.`;
		}

		if (
			msg.guild?.id !== '342983479501389826' &&
			Date.now() - msg.author.createdTimestamp < Time.Year * 2
		) {
			throw `You cannot use this command outside of the bot's support server. Join the bot support server, then use one these channels: ${command.restrictedChannels
				.map(c => `<#${c}>`)
				.join(', ')}.`;
		}

		return false;
	}
}
