import { JsonKVStore } from '@oldschoolgg/toolkit/structures';

import { BOT_TYPE } from '@/lib/constants';

export const testBotKvStore = new JsonKVStore(`./test-bot-store-${BOT_TYPE.toLowerCase()}.json`);
