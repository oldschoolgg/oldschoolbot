import { execSync } from 'child_process';
import { sleep } from 'e';

async function main() {
	try {
		execSync('docker compose up -d --wait', { stdio: 'inherit' });

		console.log('Waiting...');
		await sleep(2000);

		console.log('Starting...');
		execSync('dotenv -e .env.test -- prisma db push --schema="./prisma/schema.prisma"', { stdio: 'inherit' });
		execSync('dotenv -e .env.test -- prisma db push --schema="./prisma/robochimp.prisma"', { stdio: 'inherit' });
		execSync('yarn prebuild:scripts', { stdio: 'inherit' });
		execSync('yarn build:esbuild', { stdio: 'inherit' });

		execSync('vitest run --config vitest.integration.config.ts', {
			stdio: 'inherit',
			encoding: 'utf-8'
		});
	} catch (err) {
		throw new Error(err as any);
	} finally {
		await sleep(5000);
		console.log('Shutting down containers...');
		execSync('docker-compose down', { stdio: 'inherit' });
	}
}

main();
