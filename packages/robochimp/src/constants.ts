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
	patreonToken: z.string().min(10),
	isProduction: z.boolean().default(false),
	githubToken: z.string().min(10),
	patreonCampaignID: z.string().min(2),
	botToken: z.string().min(10),
	appID: z.string().min(10),
	supportServerID: z.string().min(10),
	patreonWebhookSecret: z.string().min(10),
	githubWebhookSecret: z.string().min(10),
	patronLogWebhookURL: z.string().min(10)
});

export const globalConfig = globalConfigSchema.parse({
	httpPort: process.env.HTTP_PORT,
	patreonToken: process.env.PATREON_TOKEN,
	isProduction,
	githubToken: process.env.GITHUB_TOKEN,
	patreonCampaignID: process.env.PATREON_CAMPAIGN_ID,
	botToken: process.env.BOT_TOKEN,
	appID: process.env.APP_ID,
	supportServerID: isProduction ? REAL_SUPPORT_SERVER_ID : TEST_SERVER_ID,
	patreonWebhookSecret: process.env.PATREON_WEBHOOK_SECRET,
	githubWebhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
	patronLogWebhookURL: process.env.PATRON_LOGS_WEBHOOK
});
