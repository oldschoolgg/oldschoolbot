import type { FastifyServer } from '../types';
import root from './root';
import githubSponsors from './webhooks/githubSponsors';

export const initRoutes = (server: FastifyServer) =>
	[root, githubSponsors].map(route => route(server));
