import { IDiscordSettings } from './lib/types';

export const botToken = '';
export const production = false;

export const SENTRY_DSN: string | null = null;
export const CLIENT_SECRET = '';
export const DEV_SERVER_ID = '';
export const GITHUB_TOKEN = '';
export const DISCORD_SETTINGS: Partial<IDiscordSettings> = {
	// Your bot unique ID goes here
	BotID: '729244028989603850'
};
// Add or replace these with your Discord ID:
export const OWNER_IDS = ['157797566833098752'];
export const ADMIN_IDS = ['425134194436341760'];
export const MAXING_MESSAGE = 'Congratulations on maxing!';
// Discord server where admin commands will be allowed:
export const SupportServer = '940758552425955348';
