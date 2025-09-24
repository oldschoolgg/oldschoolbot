import { existsSync } from 'node:fs';
import path from 'node:path';

const checkPath = path.join(import.meta.dirname, '../src/lib/bso');
const __BOT_TYPE__ = existsSync(checkPath) ? 'BSO' : 'OSB';

export const baseSnapshotPath = `tests/unit/snapshots/${__BOT_TYPE__.toLowerCase()}/`;
export const XP_MULTIPLIER = __BOT_TYPE__ === 'BSO' ? 5 : 1;
