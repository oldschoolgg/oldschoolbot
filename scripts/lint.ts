import { execSync } from 'node:child_process';

try {
	const changedFiles = execSync(
		'git diff --name-only --diff-filter=AM HEAD && git ls-files --others --exclude-standard'
	)
		.toString()
		.trim()
		.split('\n');

	if (changedFiles.length > 0) {
		execSync(`biome check ${changedFiles.join(' ')} --write --unsafe --diagnostic-level=error`, {
			stdio: 'inherit'
		});

		// Prettier
		const prettierFiles = changedFiles.filter(f => /\.(md|yaml)$/.exec(f));
		if (prettierFiles.length) {
			console.log(`Prettier is formatting: ${prettierFiles.join(', ')}`);
			execSync(`prettier --use-tabs ${prettierFiles.join(' ')} --write --log-level silent`, {
				stdio: 'inherit'
			});
		} else {
			console.log('Nothing for prettier to format.');
		}

		// Prisma
		if (changedFiles.some(f => f.includes('prisma/schema.prisma'))) {
			console.log('Formatting Prisma schema files');
			execSync(
				'prisma format --schema ./prisma/robochimp.prisma && prisma format --schema ./prisma/schema.prisma',
				{ stdio: 'inherit' }
			);
		}
	}
} catch (error) {
	console.error('Error occurred while running biome lint:', error);
	process.exit(1);
}
