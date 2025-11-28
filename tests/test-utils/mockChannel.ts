import { ChannelType } from '@oldschoolgg/discord';
import type { IChannel } from '@oldschoolgg/schemas';

import { mockSnowflake } from './misc.js';

export async function mockChannel(rng: RNGProvider): Promise<IChannel> {
	return {
		id: mockSnowflake(rng),
		guild_id: mockSnowflake(rng),
		type: ChannelType.GuildText
	};
}
