/**
 * This script copies the OSB/BSO prisma schemas to robochimps folder, so it can generate clients for them.
 *
 * The schema may not be in sync with the currently deployed OSB/BSO versions.
 */
const REPLACEMENT_ANCHOR = `provider = "prisma-client-js"`;
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..', '..', '..');

console.log('Repo root:', REPO_ROOT);

function getSchema(branch: string): string {
	const BOT_NAME = branch === 'master' ? 'osb' : 'bso';
	let rawSchemaString = execSync(`git show ${branch}:prisma/schema.prisma`, {
		cwd: REPO_ROOT,
		encoding: 'utf8'
	});
	rawSchemaString = rawSchemaString.replace(
		REPLACEMENT_ANCHOR,
		`${REPLACEMENT_ANCHOR}
  output = "./generated/${BOT_NAME}"`
	);
	rawSchemaString = rawSchemaString.replace('DATABASE_URL', `${BOT_NAME.toUpperCase()}_DATABASE_URL`);
	return rawSchemaString;
}

const masterSchema = getSchema('master');
const bsoSchema = getSchema('bso');

writeFileSync(path.resolve('prisma', 'osb_schema.prisma'), masterSchema);
writeFileSync(path.resolve('prisma', 'bso_schema.prisma'), bsoSchema);
