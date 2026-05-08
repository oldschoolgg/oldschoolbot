import { BOT_TYPE } from '../src/lib/constants.js';

export const baseSnapshotPath = `tests/unit/snapshots/${BOT_TYPE.toLowerCase()}/`;
export const XP_MULTIPLIER = BOT_TYPE === 'BSO' ? 5 : 1;
