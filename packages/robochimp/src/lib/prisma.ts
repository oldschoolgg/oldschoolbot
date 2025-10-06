import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient as BSOPrismaClient } from '@prisma/bso';
import { PrismaClient as OSBPrismaClient } from '@prisma/osb';
import { PrismaClient as RobochimpPrismaClient } from '@prisma/robochimp';

declare global {
	var roboChimpClient: RobochimpPrismaClient;
	var osbClient: OSBPrismaClient;
	var bsoClient: BSOPrismaClient;
}

global.roboChimpClient = new RobochimpPrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.ROBOCHIMP_DATABASE_URL })
});
global.osbClient = new OSBPrismaClient({ adapter: new PrismaPg({ connectionString: process.env.OSB_DATABASE_URL }) });
global.bsoClient = new BSOPrismaClient({ adapter: new PrismaPg({ connectionString: process.env.BSO_DATABASE_URL }) });

export { BSOPrismaClient, OSBPrismaClient, RobochimpPrismaClient };
