import { Argument, ArgumentStore, KlasaMessage, Possible } from 'klasa';

import { evalMathExpression } from '../lib/expressionParser';

export default class extends Argument {
	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, { aliases: ['int'] });
	}

	run(arg: string, possible: Possible, message: KlasaMessage) {
		const { min, max } = possible;

		const number = evalMathExpression(arg);

		if (!number) {
			throw message.language.get('RESOLVER_INVALID_INT', possible.name);
		}

		// @ts-ignore 2341
		return this.constructor.minOrMax(this.client, number, min, max, possible, message) ? number : null;
	}
}
