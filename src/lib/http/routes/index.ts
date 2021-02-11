import type { FastifyServer } from '../types';
import minigamesGetRoute from './hiscores/minigames';
import root from './root';
import githubSponsors from './webhooks/githubSponsors';

export const initRoutes = (server: FastifyServer) =>
	[root, githubSponsors, minigamesGetRoute].map(route => route(server));
