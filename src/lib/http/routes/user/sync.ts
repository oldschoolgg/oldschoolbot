import { FastifyServer } from '../../types';
import { rateLimit } from '../../util';
import { fetchUser } from '../oauthCallback';

const userSyncMe = (server: FastifyServer) =>
	server.route({
		method: 'GET',
		url: '/users/sync',
		async handler(request, reply) {
			const user = await fetchUser(request.auth!.token);
			reply.send(user);
		},
		config: {
			...rateLimit(3, '20 seconds'),
			requiresAuth: true
		}
	});

export default userSyncMe;
