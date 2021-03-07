import { KlasaClientOptions } from 'klasa';
import os from 'os';

import { PatreonConfig, ProviderConfig, RedditAppConfig, TwitterAppConfig } from './lib/types';

export const botToken = '';
export const providerConfig: ProviderConfig | null = {
	default: 'json'
};
export const production = os.platform() === 'linux';
export const staging = false;

export const redditAppConfig: RedditAppConfig = null;
export const twitterAppConfig: TwitterAppConfig = null;
export const patreonConfig: PatreonConfig = null;
export const customClientOptions: KlasaClientOptions = {
	prefix: '-'
};
export const sentryDSN: string | null = null;
export const HTTP_PORT = 1234;
export const CLIENT_SECRET = '';
export const CLIENT_ID = '';
export const githubToken = '';
