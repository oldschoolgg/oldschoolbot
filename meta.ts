import { existsSync } from 'node:fs';
import path from 'node:path';

export const STATIC_DEFINE = {
	__BOT_TYPE__: existsSync(path.resolve(import.meta.dirname, './src/lib/bso')) ? '"BSO"' : '"OSB"'
};
