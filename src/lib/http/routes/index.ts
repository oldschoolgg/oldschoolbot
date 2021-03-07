import type { FastifyServer } from '../types';
import { minigamesGetRoute } from './hiscores/minigames';
import { skillsGetRoute } from './hiscores/skill';
import oauthCallbackRoute from './oauthCallback';
import root from './root';
import userSettingsGetMe from './user/settings';
import githubSponsors from './webhooks/githubSponsors';

export const initRoutes = (server: FastifyServer) =>
	[
		root,
		githubSponsors,
		minigamesGetRoute,
		skillsGetRoute,
		oauthCallbackRoute,
		userSettingsGetMe
	].map(route => route(server));
