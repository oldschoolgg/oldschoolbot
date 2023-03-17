import { execSync } from 'child_process';

async function main() {
	try {
		execSync('docker compose up -d --wait', { stdio: 'inherit' });

		execSync('dotenv -e .env.example -- prisma db push', { stdio: 'inherit' });

		execSync('vitest run --config vitest.integration.config.ts', { stdio: 'inherit' });
	} catch (err) {
		throw new Error(`Failed to run integration tests: ${err}`);
	} finally {
		execSync('docker-compose down', { stdio: 'inherit' });
	}
}

main();
