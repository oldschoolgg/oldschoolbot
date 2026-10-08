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
	test('returns commit output for /info commit', async () => {
		const result = await infoCommand.run({ options: { commit: {} } } as InfoRunArg);
		const message = assertMessageObject(result);
		expect(String(message.content ?? '')).toContain('**Commit Hash:**');
		expect(String(message.content ?? '')).toContain('**Commit Message:**');
		expect(String(message.content ?? '')).not.toContain('**Uptime:**');
		expect(String(message.content ?? '')).not.toContain('**Status:**');
		expect(Array.isArray(message.components) ? message.components : []).toHaveLength(2);
	});

	test('returns detailed commit output when /info commit details:true', async () => {
		const result = await infoCommand.run({ options: { commit: { details: true } } } as unknown as InfoRunArg);
		const message = assertMessageObject(result);
		expect(String(message.content ?? '')).toContain('**Commit Date:**');
		expect(String(message.content ?? '')).toContain('**Commit Hash:**');
		expect(String(message.content ?? '')).toContain('**Code Difference:**');
		expect(String(message.content ?? '')).toContain('**Status:**');
		expect(Array.isArray(message.components) ? message.components : []).toHaveLength(2);
	});

	test('returns recent updates for /info recent_updates', async () => {
		const result = await infoCommand.run({ options: { recent_updates: {} } } as InfoRunArg);
		const message = assertMessageObject(result);
		expect(String(message.content ?? '')).toContain('**Recent Updates (Latest 10 Commits):**');
		expect(Array.isArray(message.components) ? message.components : []).toHaveLength(2);
	});

	test('returns uptime for /info uptime', async () => {
		const result = await infoCommand.run({ options: { uptime: {} } } as InfoRunArg);
		const message = assertMessageObject(result);
		expect(String(message.content ?? '')).toContain('**Uptime:**');
		expect(String(message.content ?? '')).toContain('**Bot Started:**');
		expect(Array.isArray(message.components) ? message.components : []).toHaveLength(2);
	});

	test('returns overview for /info overview', async () => {
		const result = await infoCommand.run({ options: { overview: {} } } as InfoRunArg);
		const message = assertMessageObject(result);
		expect(String(message.content ?? '')).toContain('**Uptime:**');
		expect(String(message.content ?? '')).toContain('**Commit:**');
		expect(String(message.content ?? '')).toContain('**Recent Updates (Latest 3):**');
		expect(Array.isArray(message.components) ? message.components : []).toHaveLength(2);
	});

	test('defaults to overview when no subcommand payload is provided', async () => {
		const result = await infoCommand.run({ options: {} } as InfoRunArg);
		const message = assertMessageObject(result);
		expect(String(message.content ?? '')).toContain('**Uptime:**');
		expect(String(message.content ?? '')).toContain('**Recent Updates (Latest 3):**');
	});
});
