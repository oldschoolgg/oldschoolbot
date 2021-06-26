import type { FastifyInstance } from 'fastify';

import { authenticate } from '../util';

export const onRoute = (server: FastifyInstance) =>
	server.addHook('onRoute', async route => {
		if (route.config?.requiresAuth === true && route.method !== 'OPTIONS') {
			route.onRequest = route.onRequest
				? Array.isArray(route.onRequest)
					? route.onRequest
					: [route.onRequest]
				: [];
			route.onRequest.push(authenticate);
		}
	});
