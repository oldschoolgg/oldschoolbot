import * as Sentry from '@sentry/node';
import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifyHelmet from 'fastify-helmet';
import fastifyRateLimit from 'fastify-rate-limit';
import fastifySensible from 'fastify-sensible';

import { httpPort, production } from '../../config';
import { initRoutes } from './routes';

export function makeServer() {
	const server = fastify({
		logger: true,
		trustProxy: true
	});

	server.setErrorHandler((error, _request, reply) => {
		if (reply.statusCode) {
			return reply.send(error);
		}
		if (production) {
			Sentry.captureException(error);
			reply.internalServerError();
		} else {
			console.error(error);
			reply.internalServerError(`A very bad error just occurred! ${error.message}`);
		}
	});

	server.register(fastifyHelmet);

	server.register(fastifySensible, { errorHandler: false });

	server.register(fastifyCors);

	server.register(fastifyRateLimit, {
		global: false,
		max: 20,
		timeWindow: 120_000,
		errorResponseBuilder: () => {
			return server.httpErrors.tooManyRequests();
		}
	});

	initRoutes(server);

	server.addContentTypeParser('text/plain', async () => {
		throw server.httpErrors.badRequest();
	});

	server.listen(httpPort).then(() => console.log(server.printRoutes()));
	return server;
}
