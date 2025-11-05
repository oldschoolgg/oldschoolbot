import '../../src/lib/safeglobals.js';
import '../../src/lib/cache/redis.js';

import type { OldSchoolBotClient } from '@/lib/discord/OldSchoolBotClient.js';
import { createDb } from '@/lib/globals.js';
import { TestClient } from './util.js';

await createDb();

global.globalClient = new TestClient({} as any) as any as OldSchoolBotClient;
