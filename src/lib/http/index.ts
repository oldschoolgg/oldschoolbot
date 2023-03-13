import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifySensible from '@fastify/sensible';
import fastify from 'fastify';
import fastifyRawBody from 'fastify-raw-body';

import { HTTP_PORT, production } from '../../config';
import { logError } from '../util/logError';
import { initRoutes } from './routes';

export async function makeServer() {
	const server = fastify({
		logger: false,
		trustProxy: true
	});

	server.register(fastifySensible);

	await server.register(import('@fastify/rate-limit'), {
		errorResponseBuilder: () => {
			return server.httpErrors.tooManyRequests();
		}
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

	server.register(fastifyCors);

	server.register(fastifyRawBody, {
		field: 'rawBody', // change the default request.rawBody property name
		global: true, // add the rawBody to every request. **Default true**
		encoding: 'utf8', // set it to false to set rawBody as a Buffer **Default utf8**
		runFirst: false, // get the body before any preParsing hook change/uncompress it. **Default false**
		routes: [] // array of routes, **`global`** will be ignored, wildcard routes not supported
	});

	server.addContentTypeParser('text/plain', async () => {
		throw server.httpErrors.badRequest('Bad content type.');
	});

	server.addHook('onRequest', (request, _, done) => {
		debugLog('Received HTTP request', {
			type: 'HTTP_REQUEST',
			url: request.raw.url,
			method: request.raw.method,
			headers: request.raw.headers
		});
		done();
	});

	initRoutes(server);

	server.listen({ port: HTTP_PORT });
	return server;
}
