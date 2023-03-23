import { createHmac } from 'node:crypto';

import { afterAll, beforeAll, expect, test } from 'vitest';

import { makeServer } from '../../../src/lib/http';
import { FastifyServer } from '../../../src/lib/http/types';
import { mockPatreonWebhookSecret } from '../setup';

let app: FastifyServer = null!;

beforeAll(async () => {
	app = await makeServer();
	await app.ready();
});

test('patreon route', async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/webhooks/patreon'
	});

	expect(response.statusCode).toBe(400);
	expect(response.payload).toEqual('{"statusCode":400,"error":"Bad Request","message":"Bad Request"}');

	const response2 = await app.inject({
		method: 'POST',
		url: '/webhooks/patreon',
		payload: {}
	});

	expect(response2.statusCode).toBe(401);
	expect(response2.payload).toEqual('{"statusCode":401,"error":"Unauthorized","message":"Unauthorized"}');

	const response3 = await app.inject({
		method: 'POST',
		url: '/webhooks/patreon',
		payload: {},
		headers: {
			'x-patreon-signature': 'test'
		}
	});

	expect(response3.statusCode).toBe(401);
	expect(response3.payload).toEqual('{"statusCode":401,"error":"Unauthorized","message":"Unauthorized"}');

	const payload = { someData: 'data' };
	const hmac = createHmac('md5', mockPatreonWebhookSecret);
	hmac.update(JSON.stringify(payload));
	const calculated = hmac.digest('hex');

	const response4 = await app.inject({
		method: 'POST',
		url: '/webhooks/patreon',
		payload,
		headers: {
			'x-patreon-signature': calculated
		}
	});

	expect(response4.statusCode).toBe(200);
	expect(response4.payload).toEqual('{}');
});

afterAll(async () => {
	await app.close();
});
