import { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';

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
