import { patreonTask } from '../../../../tasks/patreon';
import { FastifyServer } from '../../types';
import { verifyPatreonSecret } from '../../util';

export const patreonRoute = (server: FastifyServer) =>
	server.route({
		method: 'POST',
		url: '/webhooks/patreon',
		async handler(request, reply) {
			try {
				if (!request.rawBody || typeof request.rawBody !== 'string') throw reply.badRequest();
				const isVerified = verifyPatreonSecret(request.rawBody, request.headers['x-patreon-signature']);
				if (!isVerified) {
					throw reply.badRequest();
				}
				patreonTask.run();
				return reply.send({});
			} catch (err) {
				console.error(err);
			}
		},
		config: {}
	});
