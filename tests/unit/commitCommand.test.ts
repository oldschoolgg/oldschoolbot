import { describe, expect, test } from 'vitest';

import { commitCommand } from '@/mahoji/commands/commit.js';

type CommitRunArg = Parameters<typeof commitCommand.run>[0];
type CommitRunResult = Awaited<ReturnType<typeof commitCommand.run>>;

function assertMessageObject(result: CommitRunResult) {
	if (typeof result === 'string' || typeof result === 'number') {
		throw new Error('Expected object response');
	}
	if ('build' in result) {
		throw new Error('Expected plain message object response');
	}
	return result;
}

describe('commit command', () => {
	test('returns concise output by default', async () => {
		const result = await commitCommand.run({ options: {} } as CommitRunArg);
		const message = assertMessageObject(result);
		expect(String(message.content ?? '')).toContain('**Commit Date:**');
		expect(String(message.content ?? '')).toContain('**Code Difference:**');
		expect(String(message.content ?? '')).not.toContain('**Status:**');
		expect(Array.isArray(message.components) ? message.components : []).toHaveLength(2);
	});

	test('returns detailed output when details=true', async () => {
		const result = await commitCommand.run({ options: { details: true } } as CommitRunArg);
		const message = assertMessageObject(result);
		expect(String(message.content ?? '')).toContain('**Git Hash:**');
		expect(String(message.content ?? '')).toContain('**Full Hash:**');
		expect(String(message.content ?? '')).toContain('**Status:**');
		expect(String(message.content ?? '')).toContain('**Bot Started:**');
		expect(Array.isArray(message.components) ? message.components : []).toHaveLength(2);
	});
});
