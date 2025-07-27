import { existsSync } from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// @ts-ignore
const __BOT_TYPE__ = existsSync(path.resolve(dirname(fileURLToPath(import.meta.url)), './src/lib/bso')) ? 'BSO' : 'OSB';

export const baseSnapshotPath = `tests/unit/snapshots/${__BOT_TYPE__.toLowerCase()}/`;
export const XP_MULTIPLIER = __BOT_TYPE__ === 'BSO' ? 5 : 1;
