import { execSync } from 'node:child_process';
import path from 'node:path';
import { config } from 'dotenv';
import { sleep } from 'e';

async function main() {
	try {
		execSync('docker compose up -d --wait', { stdio: 'inherit' });

		console.log('Waiting...');
		await sleep(2000);

		console.log('Getting ready...');
		const env = { ...process.env, ...config({ path: path.resolve('.env.test') }) };

		execSync('npx prisma db push --schema="./prisma/schema.prisma"', { stdio: 'inherit', env: env.parsed });
		execSync('npx prisma db push --schema="./prisma/robochimp.prisma"', { stdio: 'inherit', env: env.parsed });

		console.log('Building...');
		execSync('yarn build', { stdio: 'inherit' });

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
		console.error(err);
		throw new Error(err as any);
	} finally {
		console.log('Shutting down containers...');
		execSync('docker-compose down', { stdio: 'inherit' });
	}
}

main();
