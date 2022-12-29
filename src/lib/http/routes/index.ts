import type { FastifyServer } from '../types';
import { commandsRoute } from './commands';
import oauthCallbackRoute from './oauthCallback';
import root from './root';

export const initRoutes = (server: FastifyServer) =>
	[root, oauthCallbackRoute, commandsRoute].map(route => route(server));
