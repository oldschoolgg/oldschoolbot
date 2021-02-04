import { FastifyServer } from '../types';
import { rateLimit } from '../util';

export default (server: FastifyServer) =>
	server.route({
		method: 'GET',
		url: '/',
		async handler(request, reply) {
			reply.send(`${JSON.stringify(request.headers, null, 4)}\n\n\n${server.printRoutes()}`);
		},
		config: {
			...rateLimit(1, '5 seconds')
		}
	});
