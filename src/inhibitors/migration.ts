import { Inhibitor, KlasaMessage } from 'klasa';

export default class extends Inhibitor {
	public async run(msg: KlasaMessage) {
		if (msg.author.id !== '157797566833098752') throw true;
	}
}
