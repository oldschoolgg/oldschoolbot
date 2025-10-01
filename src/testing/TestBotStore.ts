import { JsonKVStore } from '@oldschoolgg/toolkit';

import { BOT_TYPE } from '@/lib/constants.js';

export const testBotKvStore = new JsonKVStore(`./test-bot-store-${BOT_TYPE.toLowerCase()}.json`);
