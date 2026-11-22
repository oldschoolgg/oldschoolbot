import { describe, expect, test } from 'vitest';

import { splitSendableMessage } from '@/discord/splitSendableMessage.js';

describe('splitSendableMessage', () => {
	test('prefers lines, then words, then splits long words', () => {
		const line = 'a'.repeat(1000);
		const parts = splitSendableMessage({
			content: `${line}\n${'b'.repeat(500)} space ${'b'.repeat(1300)} word ${'c'.repeat(2100)}`
		});
		expect(parts[0].content).toBe(line);
		expect(parts.every(part => part.content!.length <= 1950)).toBe(true);
		expect(parts.map(part => part.content).join('')).toBe(`${line}
${'b'.repeat(500)} space ${'b'.repeat(1300)} word ${'c'.repeat(2100)}`);
	});

	test('keeps attachments on the final part and visibility on every part', () => {
		const files = [{ name: 'result.txt', buffer: Buffer.from('result') }];
		const parts = splitSendableMessage({ content: 'x'.repeat(2000), files, ephemeral: true });
		expect(parts).toHaveLength(2);
		expect(parts[0].files).toBeUndefined();
		expect(parts[1].files).toBe(files);
		expect(parts.every(part => part.ephemeral)).toBe(true);
	});
});
