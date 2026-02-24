import { describe, expect, test } from 'vitest';

import { infoCommand } from '@/mahoji/commands/info.js';

type InfoRunArg = Parameters<typeof infoCommand.run>[0];
type InfoRunResult = Awaited<ReturnType<typeof infoCommand.run>>;

function assertMessageObject(result: InfoRunResult) {
	if (typeof result === 'string' || typeof result === 'number') {
		throw new Error('Expected object response');
	}
	if ('build' in result) {
		throw new Error('Expected plain message object response');
	}
	return result;
}

describe('info command', () => {
	test('returns concise output by default', async () => {
		const result = await infoCommand.run({ options: {} } as InfoRunArg);
		const message = assertMessageObject(result);
		expect(String(message.content ?? '')).toContain('**Uptime:**');
		expect(String(message.content ?? '')).toContain('**Commit Message:**');
		expect(String(message.content ?? '')).not.toContain('**Status:**');
		expect(Array.isArray(message.components) ? message.components : []).toHaveLength(2);
	});

	test('returns detailed output when details=true', async () => {
		const result = await infoCommand.run({ options: { details: true } } as InfoRunArg);
		const message = assertMessageObject(result);
		expect(String(message.content ?? '')).toContain('**Commit Date:**');
		expect(String(message.content ?? '')).toContain('**Code Difference:**');
		expect(String(message.content ?? '')).toContain('**Status:**');
		expect(String(message.content ?? '')).toContain('**Recent Commits:**');
		expect(Array.isArray(message.components) ? message.components : []).toHaveLength(2);
	});
});
