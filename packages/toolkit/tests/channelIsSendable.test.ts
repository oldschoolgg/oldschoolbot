import { expect, test } from 'vitest';

import { channelIsSendable } from '../src/util/discord';

test('channelIsSendable', () => {
	expect(channelIsSendable(null)).toEqual(false);
});
