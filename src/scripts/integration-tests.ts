import { Stopwatch } from '@oldschoolgg/toolkit';

import { execAsync } from './scriptUtil';

async function main() {
	const stopwatch = new Stopwatch();
	try {
		await execAsync(['docker compose up -d --wait', 'npm install -g wait-on']);
		stopwatch.check('Docker compose finished.');

		await execAsync('wait-on tcp:5435 -t 10s');

		await execAsync([
			'yarn prisma db push --schema="./prisma/schema.prisma"',
			'yarn prisma db push --schema="./prisma/robochimp.prisma"'
		]);
		stopwatch.check('Finished prisma pushing.');

		await execAsync('yarn build:tsc');
		stopwatch.check('Finished building, starting tests.');

		console.log('Starting tests...');
		const runs = 1;
		for (let i = 0; i < runs; i++) {
			console.log(`Starting run ${i + 1}/${runs}`);
			await execAsync('vitest run --config vitest.integration.config.mts');
			console.log(`Finished run ${i + 1}/${runs}`);
		}
	} catch (err) {
		console.log(await execAsync('docker-compose logs'));
		console.error(err);
		throw new Error(err as any);
	} finally {
		await execAsync('docker-compose down');
		stopwatch.check('Finished.');
	}
}

main();
