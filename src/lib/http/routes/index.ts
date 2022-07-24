import type { FastifyServer } from '../types';
import { commandsRoute } from './commands';
import oauthCallbackRoute from './oauthCallback';
import root from './root';
import githubSponsors from './webhooks/githubSponsors';

export const initRoutes = (server: FastifyServer) =>
	[root, githubSponsors, oauthCallbackRoute, commandsRoute].map(route => route(server));
