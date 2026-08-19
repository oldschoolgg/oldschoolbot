import path from 'node:path';
import * as dotenv from 'dotenv';
import * as z from 'zod';

const isProduction = process.env.NODE_ENV === 'production';
const REAL_SUPPORT_SERVER_ID = '342983479501389826';

dotenv.config({ path: path.resolve(process.cwd(), process.env.TEST ? '.env.test' : '.env') });

const globalConfigSchema = z.object({
	isProduction: z.boolean().default(false),
	botToken: z.string().min(10),
	appID: z.string().min(10),
	supportServerID: z.string().min(10),
	robochimpDatabaseUrl: z.string().min(10).optional()
});

export const globalConfig = globalConfigSchema.parse({
	isProduction,
	botToken: process.env.OSB_REACTIONS_BOT_TOKEN ?? process.env.BOT_TOKEN,
	appID: process.env.OSB_REACTIONS_APP_ID ?? process.env.APP_ID,
	supportServerID: process.env.SUPPORT_SERVER_ID ?? (isProduction ? REAL_SUPPORT_SERVER_ID : process.env.SUPPORT_SERVER_ID),
	robochimpDatabaseUrl: process.env.ROBOCHIMP_DATABASE_URL
});
