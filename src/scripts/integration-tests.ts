import { execSync } from 'node:child_process';
import { sleep } from 'e';

async function main() {
	try {
		execSync('docker compose up -d --wait', { stdio: 'inherit' });

		console.log('Waiting...');
		await sleep(2000);

		console.log('Getting ready...');
		execSync('dotenv -e .env.test -- prisma db push --schema="./prisma/schema.prisma"', { stdio: 'inherit' });
		execSync('dotenv -e .env.test -- prisma db push --schema="./prisma/robochimp.prisma"', { stdio: 'inherit' });

		console.log('Building...');
		execSync('yarn pre:build', { stdio: 'inherit' });
		execSync('yarn build:esbuild', { stdio: 'inherit' });

		console.log('Starting tests...');
		const runs = 1;
		for (let i = 0; i < runs; i++) {
			console.log(`Starting run ${i + 1}/${runs}`);
			execSync('vitest run --config vitest.integration.config.mts sacrifice', {
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
