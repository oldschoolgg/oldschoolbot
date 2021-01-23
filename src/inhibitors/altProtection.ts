import { Command, Inhibitor, InhibitorStore, KlasaMessage } from 'klasa';

import { BitField, PerkTier, Time } from '../lib/constants';
import { UserSettings } from '../lib/settings/types/UserSettings';
import getUsersPerkTier from '../lib/util/getUsersPerkTier';

export default class extends Inhibitor {
	public constructor(store: InhibitorStore, file: string[], directory: string) {
		super(store, file, directory);
	}

	public async run(msg: KlasaMessage, command: Command) {
		if (!command.altProtection) return;
		if (getUsersPerkTier(msg.author) >= PerkTier.Four) return;

		if (
			Date.now() - msg.author.createdTimestamp < Time.Month * 6 &&
			!msg.author.settings.get(UserSettings.BitField).includes(BitField.BypassAgeRestriction)
		) {
			throw `You cannot use this command as your account is too new. Your choices are: (1) You can ask to be manually verified if you have social media accounts as proof of identity. (2) Become a Tier3 Patron (3) Wait until your account is old enough.`;
		}
	}
}
