// import supertest from 'supertest';
import { afterAll, beforeAll, expect, test } from 'vitest';

import { makeServer } from '../../src/lib/http';

const app = makeServer();
beforeAll(async () => {
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

	expect(response2.statusCode).toBe(400);
	expect(response2.payload).toEqual('{"statusCode":400,"error":"Bad Request","message":"Bad Request"}');

	const response3 = await app.inject({
		method: 'POST',
		url: '/webhooks/patreon',
		payload: {},
		headers: {
			'x-patreon-signature': 'test'
		}
	});

	expect(response3.statusCode).toBe(400);
	expect(response3.payload).toEqual('{"statusCode":400,"error":"Bad Request","message":"Bad Request"}');
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
