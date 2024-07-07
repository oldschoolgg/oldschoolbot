import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

async function getPostgresVersion() {
	const client = new PrismaClient();
	try {
		const result = await client.$queryRawUnsafe<any>('SELECT version();');
		const version = result[0].version.split(',')[0];
		return version;
	} catch (err) {
		console.error(err);
	} finally {
		await client.$disconnect();
	}
}

function getCommandOutput(command: string): string {
	try {
		return execSync(command).toString().trim();
	} catch {
		return 'Not Installed';
	}
}

export async function getSystemInfo() {
	const gitBranch = getCommandOutput('git rev-parse --abbrev-ref HEAD');
	const gitHash = getCommandOutput('git rev-parse --short HEAD');
	const postgresVersion = await getPostgresVersion();
	const singleStr = `Node ${process.version} ${postgresVersion} ${gitBranch}[${gitHash}]`;
	return {
		singleStr
	};
}
