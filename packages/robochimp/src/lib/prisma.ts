import { PrismaClient as BSOPrismaClient } from '@prisma/bso';
import { PrismaClient as OSBPrismaClient } from '@prisma/osb';
import { PrismaClient as RobochimpPrismaClient } from '@prisma/robochimp';

declare global {
	var roboChimpClient: RobochimpPrismaClient;
	var osbClient: OSBPrismaClient;
	var bsoClient: BSOPrismaClient;
}

global.roboChimpClient = new RobochimpPrismaClient();
global.osbClient = new OSBPrismaClient();
global.bsoClient = new BSOPrismaClient();

export { BSOPrismaClient, OSBPrismaClient, RobochimpPrismaClient };
