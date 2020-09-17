import { Command, Inhibitor, InhibitorStore, KlasaMessage } from 'klasa';

import { PerkTier, Time } from '../lib/constants';
import getUsersPerkTier from '../lib/util/getUsersPerkTier';

export default class extends Inhibitor {
	public constructor(store: InhibitorStore, file: string[], directory: string) {
		super(store, file, directory);
	}

	public async run(msg: KlasaMessage, command: Command) {
		if (!command.altProtection) return;
		if (getUsersPerkTier(msg.author) >= PerkTier.One) return;

		if (Date.now() - msg.author.createdTimestamp < Time.Month) {
			throw `You cannot use this command, as your account is too new and/or ` +
				`looks like it might be an alt account. Ask for help in the support server if you feel this is a mistake.`;
		}
	}
}
