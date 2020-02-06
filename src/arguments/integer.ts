import { Argument, ArgumentStore, Possible, KlasaMessage } from 'klasa';
import { Util } from 'oldschooljs';

export default class extends Argument {
	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, { aliases: ['int'] });
	}

	run(arg: string, possible: Possible, message: KlasaMessage) {
		const { min, max } = possible;
		const number = Util.fromKMB(arg.replace(/[,_]/gi, ''));
		if (!Number.isInteger(number)) {
			throw message.language.get('RESOLVER_INVALID_INT', possible.name);
		}

		// @ts-ignore 2341
		return Argument.minOrMax(number, min, max, possible, message) ? number : null;
	}
}
