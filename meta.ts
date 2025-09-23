import { existsSync } from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const STATIC_DEFINE = {
	// @ts-expect-error
	__BOT_TYPE__: existsSync(path.resolve(dirname(fileURLToPath(import.meta.url)), './src/lib/bso')) ? '"BSO"' : '"OSB"'
};

// If running with tsx, this will apply the static define to the globalThis object.
export function applyStaticDefine() {
	for (const [key, value] of Object.entries(STATIC_DEFINE)) {
		(globalThis as any)[key] = JSON.stringify(value);
		console.log(`Static define applied: ${key} = ${(globalThis as any)[key]}`);
	}
}
