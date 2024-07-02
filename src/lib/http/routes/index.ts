import type { FastifyServer } from '../types';
import { commandsRoute } from './commands';
import githubSponsors from './webhooks/githubSponsors';
import { patreonRoute } from './webhooks/patreon';

export const initRoutes = (server: FastifyServer) =>
	[githubSponsors, commandsRoute, patreonRoute].map(route => route(server));
