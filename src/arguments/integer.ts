import { Argument, ArgumentStore, KlasaMessage, Possible } from 'klasa';
import { Util } from 'oldschooljs';

export default class extends Argument {
	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, { aliases: ['int'] });
	}

	run(arg: string, possible: Possible, message: KlasaMessage) {
		const { min, max } = possible;

		/* 
			remove all valid characters from the passed arg
			if there are still some remaining, the passed arg is an invalid kmb number
			throw and return
			
			this fixes "3rd age" items from being resolved as integers
		*/
		const checkValidKMB = arg.replace(/[0-9,_.kmb]/gi, '');
		if (checkValidKMB.length > 0) {
			throw message.language.get('RESOLVER_INVALID_INT', possible.name);
		}

		const number = Util.fromKMB(arg.replace(/[,_]/gi, ''));
		if (!Number.isInteger(number)) {
			throw message.language.get('RESOLVER_INVALID_INT', possible.name);
		}

		// @ts-ignore 2341
		return this.constructor.minOrMax(this.client, number, min, max, possible, message)
			? number
			: null;
	}
}
