import { User } from 'discord.js';
import { Extendable, ExtendableStore, Gateway } from 'klasa';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	// @ts-ignore 2784
	public get settings(this: User) {
		const userGateway = this.client.gateways.get('users') as Gateway;
		const cachedSettings = userGateway.get(this.id);
		if (cachedSettings) return cachedSettings;
		const settings = userGateway.create(this);
		settings.sync(true).then(_s => userGateway.cache.set(this.id, { settings }));
		return settings;
	}
}
