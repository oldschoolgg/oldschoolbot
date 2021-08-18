import { KlasaClientOptions } from 'klasa';

import { PatreonConfig, ProviderConfig, RedditAppConfig, TwitterAppConfig } from './lib/types';

export const botToken = '';
export const providerConfig: ProviderConfig | null = {
	default: 'postgres',
	postgres: {
		database: 'postgres',
		user: 'postgres',
		password: 'postgres',
		port: 5432
	}
};
export const production = false;

export const redditAppConfig: RedditAppConfig = null;
export const twitterAppConfig: TwitterAppConfig = null;
export const patreonConfig: PatreonConfig = null;
export const customClientOptions: Partial<KlasaClientOptions> = {
	prefix: '-'
};
export const SENTRY_DSN: string | null = null;
export const HTTP_PORT = 1234;
export const CLIENT_SECRET = '';
export const CLIENT_ID = '';
export const GITHUB_TOKEN = '';
