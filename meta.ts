import { existsSync } from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const STATIC_DEFINE = {
	__BOT_TYPE__: existsSync(path.resolve(dirname(fileURLToPath(import.meta.url)), './src/lib/bso')) ? '"BSO"' : '"OSB"'
};
