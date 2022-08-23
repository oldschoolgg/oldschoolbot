import { User } from 'discord.js';
import { Extendable, ExtendableStore, KlasaClient } from 'klasa';

import { Events, PerkTier } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	// @ts-ignore 2784
	public get bitfield(this: User) {
		return this.settings.get(UserSettings.BitField);
	}

	// @ts-ignore 2784
	get sanitizedName(this: User) {
		return `(${this.username.replace(/[()]/g, '')})[${this.id}]`;
	}

	public log(this: User, stringLog: string) {
		this.client.emit(Events.Log, `${this.sanitizedName} ${stringLog}`);
	}

	// @ts-ignore 2784
	public get badges(this: User) {
		const username = this.settings.get(UserSettings.RSN);
		if (!username) return '';
		return (this.client as KlasaClient)._badgeCache.get(username.toLowerCase()) || '';
	}

	// @ts-ignore 2784
	public get perkTier(this: User): PerkTier {
		return getUsersPerkTier(this);
	}
}
