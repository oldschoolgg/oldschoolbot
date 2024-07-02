import { afterAll, beforeAll, expect, test } from 'vitest';

import { makeServer } from '../../../src/lib/http';
import { FastifyServer } from '../../../src/lib/http/types';

let app: FastifyServer = null!;
beforeAll(async () => {
	app = await makeServer(5040);
	await app.ready();
});

test('github route', async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/webhooks/github_sponsors'
	});

	expect(response.statusCode).toBe(400);
	expect(response.payload).toEqual('{"statusCode":400,"error":"Bad Request","message":"Bad Request"}');

	const response2 = await app.inject({
		method: 'POST',
		url: '/webhooks/github_sponsors',
		payload: {},
		headers: {
			'x-hub-signature': 'test'
		}
	});

	expect(response2.statusCode).toBe(400);
	expect(response2.payload).toEqual('{"statusCode":400,"error":"Bad Request","message":"Bad Request"}');
});

afterAll(async () => {
	await app.close();
});
