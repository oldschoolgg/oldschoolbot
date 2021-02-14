import type { FastifyServer } from '../types';
import { minigamesGetRoute } from './hiscores/minigames';
import { skillsGetRoute } from './hiscores/skill';
import root from './root';
import githubSponsors from './webhooks/githubSponsors';

export const initRoutes = (server: FastifyServer) =>
	[root, githubSponsors, minigamesGetRoute, skillsGetRoute].map(route => route(server));
