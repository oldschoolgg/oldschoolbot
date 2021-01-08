import { Command, Inhibitor, KlasaMessage } from 'klasa';

export default class extends Inhibitor {
	public async run(_msg: KlasaMessage, command: Command) {
		if (_msg.author.id === '157797566833098752') return;
		if (command.testingCommand || command.category === 'Testing') {
			if (
				this.client.production ||
				!this.client.user ||
				this.client.user.id === '303730326692429825'
			) {
				return true;
			}
		}
	}
}
