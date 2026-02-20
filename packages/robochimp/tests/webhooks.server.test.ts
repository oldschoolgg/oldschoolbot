import { MathRNG } from 'node-rng';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { startServer } from '@/http/server.js';
import { initPrismaClients } from '@/lib/prisma.js';

const app = await startServer(MathRNG.randInt(2000, 65000));
await initPrismaClients();
globalThis.globalClient = {} as any;

const mockVerifyPatreonSecret = vi.fn<(raw: string, sig?: string) => boolean>();
const mockParseStrToTier = vi.fn<(name: string) => string | null>();
const mockPatreonRun = vi.fn<() => Promise<string[] | null>>();
const mockPatreonChangeTier = vi.fn();
const mockPatreonRemovePerks = vi.fn();
vi.mock('../src/lib/patreon.js', () => ({
	verifyPatreonSecret: (raw: string, sig?: string) => mockVerifyPatreonSecret(raw, sig),
	parseStrToTier: (name: string) => mockParseStrToTier(name),
	patreonTask: {
		run: () => mockPatreonRun(),
		changeTier: (...args: unknown[]) => mockPatreonChangeTier(...args),
		removePerks: (...args: unknown[]) => mockPatreonRemovePerks(...args)
	}
}));
const mockVerifyGithubSecret = vi.fn<(raw: string, sig?: string) => boolean>();
vi.mock('../src/lib/githubSponsor.js', () => ({
	verifyGithubSecret: (raw: string, sig?: string) => mockVerifyGithubSecret(raw, sig)
}));
const mockWebhookSend = vi.fn();
vi.mock('../src/util.js', () => ({
	patronLogWebhook: { send: (...args: unknown[]) => mockWebhookSend(...args) }
}));

const TEST_USER_ID = '123456789012345678';

async function testRequest(
	path: string,
	options?: {
		method?: string;
		body?: any;
		headers?: Record<string, string>;
		authToken?: string;
	}
) {
	if (typeof path !== 'string' || !path.startsWith('/')) {
		throw new Error('Path must be a string starting with /');
	}

	const headers: Record<string, string> = {
		'content-type': 'application/json',
		...(options?.headers ?? {})
	};

	if (options?.authToken) {
		headers['cookie'] = `token=${options.authToken}`;
	}

	const result = await app.request(path, {
		method: (options?.method ?? 'GET') as any,
		headers,
		body: options?.body ? JSON.stringify(options.body) : undefined
	});

	return {
		status: result.status,
		text: () => result.text(),
		json: () => result.json()
	};
}

beforeAll(async () => {
	mockVerifyPatreonSecret.mockReset().mockImplementation((_raw, sig) => sig === 'ok');
	mockParseStrToTier.mockReset().mockImplementation(name => (/tier\s*1/i.test(name) ? 'T1' : null));
	mockPatreonRun.mockReset().mockResolvedValue(['a', 'b']);
	mockPatreonChangeTier.mockReset();
	mockPatreonRemovePerks.mockReset();
	mockVerifyGithubSecret.mockReset().mockImplementation((_raw, sig) => sig === 'ok');
	mockWebhookSend.mockReset();
}, 25_000);

describe('Server Webhooks', () => {
	it('POST /webhooks/patreon missing header -> 400', async () => {
		const res = await testRequest('/webhooks/patreon', { method: 'POST', body: {} });
		expect(res.status).toBe(400);
	});

	it('POST /webhooks/patreon invalid -> 400', async () => {
		const res = await testRequest('/webhooks/patreon', {
			method: 'POST',
			body: {},
			headers: { 'x-patreon-signature': 'bad' }
		});
		expect(res.status).toBe(400);
	});

	it.skip('POST /webhooks/patreon valid -> 200, runs task', async () => {
		const res = await testRequest('/webhooks/patreon', {
			method: 'POST',
			body: {},
			headers: { 'x-patreon-signature': 'ok' }
		});
		expect(await res.text()).toBe('OK');
		expect(res.status).toBe(200);
		await Promise.resolve();
		expect(mockPatreonRun).toHaveBeenCalledTimes(1);
		expect(mockWebhookSend).toHaveBeenCalledWith('a\nb'.slice(0, 1950));
	});

	it('POST /webhooks/github invalid sig -> 400', async () => {
		const payload = { action: 'created', sender: { id: 999 }, sponsorship: { tier: { name: 'Tier 1' } } };
		const res = await testRequest('/webhooks/github', {
			method: 'POST',
			body: payload,
			headers: { 'content-type': 'application/json', 'x-hub-signature': 'bad' }
		});
		expect(res.status).toBe(400);
	});

	it.skip('POST /webhooks/github created -> changeTier', async () => {
		const payload = { action: 'created', sender: { id: 999 }, sponsorship: { tier: { name: 'Tier 1' } } };
		const res = await testRequest('/webhooks/github', {
			method: 'POST',
			body: payload,
			headers: { 'content-type': 'application/json', 'x-hub-signature': 'ok' }
		});
		expect(res.status).toBe(200);
		expect(mockPatreonChangeTier).toHaveBeenCalledTimes(1);
		const [ruser, tier] = mockPatreonChangeTier.mock.calls[0];
		expect((ruser as any).id).toBe(BigInt(TEST_USER_ID));
		expect(tier).toBe('T1');
	});
});
