import { execSync } from 'child_process';
import { sleep } from 'e';

async function main() {
	try {
		execSync('docker compose up -d --wait', { stdio: 'inherit' });
		await sleep(800);

		execSync('dotenv -e .env.example -- prisma db push --schema="./prisma/schema.prisma"', { stdio: 'inherit' });
		execSync('dotenv -e .env.example -- prisma db push --schema="./prisma/robochimp.prisma"', { stdio: 'inherit' });
		execSync('yarn prebuild:scripts', { stdio: 'inherit' });
		execSync('yarn build:esbuild', { stdio: 'inherit' });

		execSync('vitest run --coverage --config vitest.integration.config.ts', {
			stdio: 'inherit'
		});
	} catch (err) {
		throw new Error(`Failed to run integration tests: ${err}`);
	} finally {
		execSync('docker-compose down', { stdio: 'inherit' });
	}
}

main();
