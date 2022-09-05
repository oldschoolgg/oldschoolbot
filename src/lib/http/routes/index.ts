import type { FastifyServer } from '../types';
import { commandsRoute } from './commands';
import oauthCallbackRoute from './oauthCallback';
import root from './root';
import githubSponsors from './webhooks/githubSponsors';
import { patreonRoute } from './webhooks/patreon';

export const initRoutes = (server: FastifyServer) =>
	[root, githubSponsors, oauthCallbackRoute, commandsRoute, patreonRoute].map(route => route(server));
