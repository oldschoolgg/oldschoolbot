import { KlasaClientOptions } from 'klasa';

import { IDiscordSettings, PatreonConfig, ProviderConfig } from './lib/types';

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

export const patreonConfig: PatreonConfig = null;
export const customClientOptions: Partial<KlasaClientOptions> = {
	prefix: '-',
	// Your account unique ID
	owners: ['157797566833098752']
};
export const SENTRY_DSN: string | null = null;
export const HTTP_PORT = 1234;
export const CLIENT_SECRET = '';
export const CLIENT_ID = '';
export const DEV_SERVER_ID = '';
export const GITHUB_TOKEN = '';
export const DISCORD_SETTINGS: Partial<IDiscordSettings> = {
	// Your bot unique ID goes here
	BotID: '303730326692429825'
};
// Add or replace these with your Discord ID:
export const OWNER_IDS = ['157797566833098752'];
export const MAXING_MESSAGE = 'Congratulations on maxing!';
// Discord server where admin commands will be allowed:
export const SupportServer = '940758552425955348';
