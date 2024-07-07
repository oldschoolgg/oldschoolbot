import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

async function getPostgresVersion() {
	const client = new PrismaClient();
	try {
		const result = await client.$queryRawUnsafe<any>('SELECT version();');
		const version = result[0].version.split(',')[0];
		return version;
	} catch (err) {
		await client.$disconnect();
		console.log('Failed to execute postgres query. Is postgres running?');
		process.exit(1);
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
	const yarnVersion = getCommandOutput('yarn --version');
	if (yarnVersion !== '4.3.1') {
		console.error('ERROR: You are not using yarn v4.3.1.');
		process.exit(1);
	}
	if (process.version !== 'v20.15.0') {
		console.error('ERROR: You are not using Node v20.15.0.');
		process.exit(1);
	}
	const postgresVersion = await getPostgresVersion();
	const singleStr = `Node ${process.version} ${postgresVersion} ${gitBranch}[${gitHash}]`;
	return {
		singleStr
	};
}
