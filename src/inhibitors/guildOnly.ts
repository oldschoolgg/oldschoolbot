import { Command, Inhibitor, InhibitorStore, KlasaMessage, KlasaClient } from 'klasa';

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
		if (!command.guildOnly) return;

		return !msg.guild;
	}
}
