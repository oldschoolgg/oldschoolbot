import { expect, test } from 'vitest';
import { cleanUsername } from '../src/util';

test('cleanUsername', () => {
	expect(cleanUsername('just_as')).toEqual('just_as');
	expect(cleanUsername('just as')).toEqual('just as');
	expect(cleanUsername('@justas')).toEqual('justas');
	expect(cleanUsername('*justas*@')).toEqual('justas');
	expect(cleanUsername('|justas')).toEqual('justas');
});
