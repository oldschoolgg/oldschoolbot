import '../../src/lib/safeglobals.js';
import '../../src/lib/cache/redis.js';

import { globalConfig } from '@/lib/constants.js';
import type { OldSchoolBotClient } from '@/lib/discord/OldSchoolBotClient.js';
import { createDb } from '@/lib/globals.js';
import { TestClient } from './util.js';

await createDb();
await prisma.clientStorage.upsert({
	where: { id: globalConfig.clientID },
	create: { id: globalConfig.clientID },
	update: {}
});

global.globalClient = new TestClient({} as any) as any as OldSchoolBotClient;

import type { Bank } from 'oldschooljs';
import { vi } from 'vitest';

import { MUserClass } from '@/lib/MUser.js';
import type { ActivityTaskData } from '@/lib/types/minions.js';
import { handleTripFinishResults } from '../test-utils/misc.js';

vi.mock('../../src/lib/util/handleTripFinish.js', async importOriginal => {
	const originalModule: any = await importOriginal();
	return {
		handleTripFinish: async (
			userOrParams:
				| MUser
				| {
						user: MUser;
						channelId: string;
						message: SendableMessage;
						data: ActivityTaskData;
						loot?: Bank | null;
						messages?: string[];
				  },
			_channelId?: string,
			_message?: SendableMessage,
			_data?: ActivityTaskData,
			_loot?: Bank | null,
			_messages?: string[]
		) => {
			const {
				data,
				user,
				loot,
				messages: inputMessages,
				message: inputMessage
			} = userOrParams instanceof MUserClass
				? {
						user: userOrParams as MUser,
						message: _message!,
						data: _data!,
						loot: _loot!,
						messages: _messages
					}
				: userOrParams;

			handleTripFinishResults.set(`${user.id}-${data.type}`, {
				message: inputMessage,
				messages: inputMessages,
				loot
			});
			return (originalModule as any).handleTripFinish(
				userOrParams as any,
				_channelId,
				_message,
				_data,
				_loot,
				_messages
			);
		}
	};
});
