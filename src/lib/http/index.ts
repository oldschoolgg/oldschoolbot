import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifyHelmet from 'fastify-helmet';
import fastifyRateLimit from 'fastify-rate-limit';
import fastifySensible from 'fastify-sensible';

import { HTTP_PORT, production } from '../../config';
import { logError } from '../util/logError';
import { initHooks } from './hooks';
import { initRoutes } from './routes';

export function makeServer() {
	const server = fastify({
		logger: false,
		trustProxy: true
	});

	server.setErrorHandler((error, _request, reply) => {
		if (reply.statusCode) {
			reply.send(error);
			return;
		}
		if (production) {
			logError(error);
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

	initHooks(server);
	initRoutes(server);

	server.addContentTypeParser('text/plain', async () => {
		throw server.httpErrors.badRequest('Bad content type.');
	});

	server.listen(HTTP_PORT).then(() => console.log(server.printRoutes()));
	return server;
}
