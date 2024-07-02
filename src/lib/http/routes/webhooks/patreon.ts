import { patreonTask } from '../../../patreon';
import type { FastifyServer } from '../../types';
import { verifyPatreonSecret } from '../../util';

export const patreonRoute = (server: FastifyServer) =>
	server.route({
		method: 'POST',
		url: '/webhooks/patreon',
		async handler(request, reply) {
			if (!request.rawBody || typeof request.rawBody !== 'string') {
				return reply.badRequest();
			}
			const isVerified = verifyPatreonSecret(request.rawBody, request.headers['x-patreon-signature']);
			if (!isVerified) {
				return reply.unauthorized();
			}
			patreonTask.run();
			return reply.send({});
		},
		config: {}
	});
