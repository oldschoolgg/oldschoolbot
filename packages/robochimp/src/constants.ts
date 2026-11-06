import path from 'node:path';
import * as dotenv from 'dotenv';
import * as z from 'zod';

const isProduction = process.env.NODE_ENV === 'production';
const REAL_SUPPORT_SERVER_ID = '342983479501389826';
export const TEST_SERVER_ID = '940758552425955348';
export const MASS_HOSTER_ROLE_ID = '734055552933429280';

dotenv.config({ path: path.resolve(process.cwd(), process.env.TEST ? '.env.test' : '.env') });

const globalConfigSchema = z.object({
	httpPort: z.coerce.number().int(),
	magnaPatreonToken: z.string().min(10).optional(),
	cyrPatreonToken: z.string().min(10).optional(),
	isProduction: z.boolean().default(false),
	githubToken: z.string().min(10).optional(),
	magnaPatreonCampaignID: z.string().min(2).optional(),
	cyrPatreonCampaignID: z.string().min(2).optional(),
	botToken: z.string().min(10),
	appID: z.string().min(10),
	supportServerID: z.string().min(10),
	magnaPatreonWebhookSecret: z.string().min(10),
	cyrPatreonWebhookSecret: z.string().min(10).optional(),
	cyrPatreonTier0ID: z.string().min(1).optional(),
	cyrPatreonTier1ID: z.string().min(1).optional(),
	cyrPatreonTier2ID: z.string().min(1).optional(),
	cyrPatreonTier3ID: z.string().min(1).optional(),
	cyrPatreonTier4ID: z.string().min(1).optional(),
	cyrPatreonTier5ID: z.string().min(1).optional(),
	cyrPatreonTier6ID: z.string().min(1).optional(),
	cyrPatreonTier7ID: z.string().min(1).optional(),
	githubWebhookSecret: z.string().min(10).optional(),
	patronLogWebhookURL: z.string().min(10),
	apiUrl: z.url(),
	frontendUrl: z.url(),
	cookieOrigin: z.string()
});

export const globalConfig = globalConfigSchema.parse({
	httpPort: process.env.HTTP_PORT,
	magnaPatreonToken: process.env.MAGNA_PATREON_TOKEN,
	cyrPatreonToken: process.env.CYR_PATREON_TOKEN,
	isProduction,
	githubToken: process.env.GITHUB_TOKEN,
	magnaPatreonCampaignID: process.env.MAGNA_PATREON_CAMPAIGN_ID,
	cyrPatreonCampaignID: process.env.CYR_PATREON_CAMPAIGN_ID,
	botToken: process.env.BOT_TOKEN,
	appID: process.env.APP_ID,
	supportServerID:
		process.env.SUPPORT_SERVER_ID ?? (isProduction ? REAL_SUPPORT_SERVER_ID : process.env.SUPPORT_SERVER_ID),
	magnaPatreonWebhookSecret: process.env.MAGNA_PATREON_WEBHOOK_SECRET,
	cyrPatreonWebhookSecret: process.env.CYR_PATREON_WEBHOOK_SECRET,
	cyrPatreonTier0ID: process.env.CYR_PATREON_TIER_0_ID,
	cyrPatreonTier1ID: process.env.CYR_PATREON_TIER_1_ID,
	cyrPatreonTier2ID: process.env.CYR_PATREON_TIER_2_ID,
	cyrPatreonTier3ID: process.env.CYR_PATREON_TIER_3_ID,
	cyrPatreonTier4ID: process.env.CYR_PATREON_TIER_4_ID,
	cyrPatreonTier5ID: process.env.CYR_PATREON_TIER_5_ID,
	cyrPatreonTier6ID: process.env.CYR_PATREON_TIER_6_ID,
	cyrPatreonTier7ID: process.env.CYR_PATREON_TIER_7_ID,
	githubWebhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
	patronLogWebhookURL: process.env.PATRON_LOGS_WEBHOOK,
	apiUrl: process.env.API_URL,
	frontendUrl: process.env.FRONTEND_URL,
	cookieOrigin: process.env.COOKIE_ORIGIN
});

if (!process.env.OAUTH_SECRET) {
	throw new Error('OAUTH_SECRET is not set in environment variables');
}
