import { Command, Inhibitor, InhibitorStore, KlasaMessage, KlasaClient } from 'klasa';
import { Time } from '../lib/constants';

export default class extends Inhibitor {
	public constructor(
		client: KlasaClient,
		store: InhibitorStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory);
	}

	public async run(msg: KlasaMessage, command: Command) {
		if (!command.altProtection) return;

		if (Date.now() - msg.author.createdTimestamp < Time.Month) {
			throw `You cannot use this command, as your account is too new and/or ` +
				`looks like it might be an alt account. Ask for help in the support server if you feel this is a mistake.`;
		}
	}
}
