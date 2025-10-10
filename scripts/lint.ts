import { execAsync, tearDownScript } from './scriptUtil.js';

async function lintScript() {
	await Promise.all([
		execAsync('prettier --use-tabs --write "**/*.json" && biome check --write --unsafe --diagnostic-level=error'),
		execAsync('prettier --use-tabs --write "**/*.{yaml,yml,css,html}"'),
		execAsync('prisma format --schema ./prisma/robochimp.prisma && prisma format --schema ./prisma/schema.prisma')
	]);
	tearDownScript();
}

lintScript();
