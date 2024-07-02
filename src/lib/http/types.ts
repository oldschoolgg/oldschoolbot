import type { IncomingMessage, Server, ServerResponse } from 'node:http';
import type { FastifyInstance, FastifyLoggerInstance } from 'fastify';

interface UserAuth {
	token: string;
	user_id: string;
}

declare module 'fastify' {
	interface FastifyRequest {
		auth: UserAuth | undefined;
	}
}

export type FastifyServer = FastifyInstance<Server, IncomingMessage, ServerResponse, FastifyLoggerInstance>;
