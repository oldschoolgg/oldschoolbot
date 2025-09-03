import { PrismaClient as BSOPrismaClient } from '../../prisma/generated/bso/index.js';
import { PrismaClient as OSBPrismaClient } from '../../prisma/generated/osb/index.js';
import { PrismaClient as RobochimpPrismaClient } from '../../prisma/generated/robochimp/index.js';

declare global {
	var roboChimpClient: RobochimpPrismaClient;
	var osbClient: OSBPrismaClient;
	var bsoClient: BSOPrismaClient;
}

global.roboChimpClient = new RobochimpPrismaClient();
global.osbClient = new OSBPrismaClient();
global.bsoClient = new BSOPrismaClient();

export { BSOPrismaClient, OSBPrismaClient, RobochimpPrismaClient };
