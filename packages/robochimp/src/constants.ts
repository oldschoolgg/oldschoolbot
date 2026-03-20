import path from 'node:path';
import * as dotenv from 'dotenv';
import * as z from 'zod';

const isProduction = process.env.NODE_ENV === 'production';
const REAL_SUPPORT_SERVER_ID = '342983479501389826';
export const TEST_SERVER_ID = '940758552425955348';
export const MASS_HOSTER_ROLE_ID = '734055552933429280';

dotenv.config({ path: path.resolve(process.cwd(), process.env.TEST ? '.env.test' : '.env') });

function devOrEnv(value: string | undefined, fallback: string): string {
	return isProduction ? (value ?? '') : (value ?? fallback);
}

const globalConfigSchema = z.object({
	httpPort: z.coerce.number().int(),
	patreonToken: z.string().min(10),
	isProduction: z.boolean().default(false),
	githubToken: z.string().min(10),
	patreonCampaignID: z.string().min(2),
	botToken: z.string().min(10),
	appID: z.string().min(10),
	supportServerID: z.string().min(10),
	patreonWebhookSecret: z.string().min(10),
	githubWebhookSecret: z.string().min(10),
	patronLogWebhookURL: z.string().min(10),
	apiUrl: z.url(),
	frontendUrl: z.url(),
	cookieOrigin: z.string()
});

export const globalConfig = globalConfigSchema.parse({
	httpPort: process.env.HTTP_PORT ?? '3002',
	patreonToken: devOrEnv(process.env.PATREON_TOKEN, 'dev_patreon_token_12345'),
	isProduction,
	githubToken: devOrEnv(process.env.GITHUB_TOKEN, 'dev_github_token_12345'),
	patreonCampaignID: devOrEnv(process.env.PATREON_CAMPAIGN_ID, 'dev_campaign_12345'),
	botToken: devOrEnv(process.env.BOT_TOKEN, 'dev_bot_token_12345'),
	appID: devOrEnv(process.env.APP_ID ?? process.env.CLIENT_ID, '123456789012345678'),
	supportServerID: isProduction ? REAL_SUPPORT_SERVER_ID : TEST_SERVER_ID,
	patreonWebhookSecret: devOrEnv(process.env.PATREON_WEBHOOK_SECRET, 'dev_patreon_webhook_12345'),
	githubWebhookSecret: devOrEnv(process.env.GITHUB_WEBHOOK_SECRET, 'dev_github_webhook_12345'),
	patronLogWebhookURL: devOrEnv(process.env.PATRON_LOGS_WEBHOOK, 'https://example.com/webhook/test'),
	apiUrl: devOrEnv(process.env.API_URL, 'http://localhost:3002'),
	frontendUrl: devOrEnv(process.env.FRONTEND_URL, 'http://localhost:4321'),
	cookieOrigin: devOrEnv(process.env.COOKIE_ORIGIN, 'http://localhost:4321')
});

if (!process.env.OAUTH_SECRET && isProduction) {
	throw new Error('OAUTH_SECRET is not set in environment variables');
}
