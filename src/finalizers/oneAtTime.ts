import { Finalizer, Command, KlasaMessage } from 'klasa';

export default class extends Finalizer {
	run(msg: KlasaMessage, command: Command) {
		if (command.oneAtTime && this.client.oneCommandAtATimeCache.has(msg.author.id)) {
			this.client.oneCommandAtATimeCache.delete(msg.author.id);
		}
	}
}
