import { execSync } from 'node:child_process';
import path from 'node:path';
import { Stopwatch } from '@oldschoolgg/toolkit';
import { config } from 'dotenv';
import { sleep } from 'e';

async function main() {
	const stopwatch = new Stopwatch();
	try {
		execSync('docker compose up -d --wait', { stdio: 'inherit' });
		stopwatch.check('Docker compose finished.');

		await sleep(500);

		const env = { ...process.env, ...config({ path: path.resolve('.env.test') }).parsed };
		execSync('yarn prisma db push --schema="./prisma/schema.prisma"', { stdio: 'inherit', env });
		execSync('yarn prisma db push --schema="./prisma/robochimp.prisma"', { stdio: 'inherit', env });
		stopwatch.check('Finished prisma pushing.');

		execSync('yarn build:tsc', { stdio: 'inherit' });
		stopwatch.check('Finished building, starting tests.');

		console.log('Starting tests...');
		const runs = 1;
		for (let i = 0; i < runs; i++) {
			console.log(`Starting run ${i + 1}/${runs}`);
			execSync('vitest run --config vitest.integration.config.mts', {
				stdio: 'inherit',
				encoding: 'utf-8'
			});
			console.log(`Finished run ${i + 1}/${runs}`);
		}
	} catch (err) {
		console.log(execSync('docker-compose logs', { encoding: 'utf-8' }));
		console.error(err);
		throw new Error(err as any);
	} finally {
		execSync('docker-compose down', { stdio: 'inherit' });
		stopwatch.check('Finished.');
	}
}

main();
