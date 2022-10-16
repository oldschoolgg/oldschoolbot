import { mockRandom, resetMockRandom } from 'jest-mock-random';

import { Emoji } from '../../src/lib/constants';
import { askCommand } from '../../src/mahoji/commands/ask';
import { patreonCommand } from '../../src/mahoji/commands/patreon';
import { mockUser } from '../utils';

describe('Commands', () => {
	afterEach(resetMockRandom);
	test('patreon', () => {
		expect(patreonCommand.run({} as any)).resolves.toEqual(
			`You can become a patron to support me or thank me if you're enjoying the bot, and receive some perks. It's highly appreciated. <https://www.patreon.com/oldschoolbot> OR <https://github.com/sponsors/gc> ${Emoji.PeepoOSBot}`
		);
	});
	test('ask', () => {
		mockRandom([0.1]);
		expect(askCommand.run({ user: mockUser(), options: { question: 'test?' } } as any)).resolves.toEqual(
			'Magnaboy asked: *test?*, and my answer is **Definitely.**.'
		);
	});
});
