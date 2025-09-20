import { expect, test } from 'vitest';

import { channelIsSendable } from '../src/util/discord/index.js';

test('channelIsSendable', () => {
	expect(channelIsSendable(null)).toEqual(false);
});
