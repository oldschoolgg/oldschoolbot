import type { FastifyServer } from '../types';
import githubSponsors from './webhooks/githubSponsors';
import { patreonRoute } from './webhooks/patreon';

export const initRoutes = (server: FastifyServer) => [githubSponsors, patreonRoute].map(route => route(server));
