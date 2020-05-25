import { Command, KlasaMessage } from 'klasa';

import { randomItemFromArray } from '../../lib/util';

export default class extends Command {
	async run(msg: KlasaMessage) {
		return msg.send(
			randomItemFromArray([
				'Yes.',
				'No.',
				'No chance.',
				'Definitely.',
				'Maybe.',
				"It's possible.",
				'Unlikely.',
				'Obviously yes.',
				'I think so.',
				'0 chance.',
				'100%.',
				'Without a doubt.',
				'No way.'
			])
		);
	}
}
