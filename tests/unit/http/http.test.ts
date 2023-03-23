import { afterAll, beforeAll, expect, test } from 'vitest';

import { makeServer } from '../../../src/lib/http';
import { FastifyServer } from '../../../src/lib/http/types';

let app: FastifyServer = null!;
beforeAll(async () => {
	app = await makeServer();
	await app.ready();
});

test('Commands route', async () => {
	const response = await app.inject({
		method: 'GET',
		url: '/commands'
	});

	expect(response.statusCode).toBe(200);
	expect(response.payload).toEqual('[{"name":"test","desc":"test description","subOptions":[]}]');
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

test('root route ratelimiting', async () => {
	await app.inject({
		method: 'GET',
		url: '/'
	});
	const response = await app.inject({
		method: 'GET',
		url: '/'
	});

	expect(response.statusCode).toBe(429);
});

afterAll(async () => {
	await app.close();
});
