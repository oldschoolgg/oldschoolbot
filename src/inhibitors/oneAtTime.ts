import { Command, Inhibitor, InhibitorStore, KlasaMessage } from 'klasa';

export default class extends Inhibitor {
	public constructor(store: InhibitorStore, file: string[], directory: string) {
		super(store, file, directory);
	}

	public async run(msg: KlasaMessage, command: Command) {
		if (!command.oneAtTime) return;

		if (
			msg.author.isBusy &&
			!['157797566833098752', '242043489611808769'].includes(msg.author.id)
		) {
			throw true;
		}
	}
}
