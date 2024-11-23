import { expect, test } from 'vitest';
import { channelIsSendable } from '../src/util';

test('channelIsSendable', () => {
	expect(channelIsSendable(null)).toEqual(false);
});
