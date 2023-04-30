import { expect, test } from 'vitest';

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
