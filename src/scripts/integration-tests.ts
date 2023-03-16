import { execSync } from 'child_process';

async function main() {
	try {
		execSync('docker compose up -d --wait', { stdio: 'inherit' });

		execSync('dotenv -e .env.example -- prisma db push', { stdio: 'inherit' });

		execSync('yarn test:integration:run', { stdio: 'inherit' });
	} finally {
		execSync('docker-compose down', { stdio: 'inherit' });
	}
}

main();
