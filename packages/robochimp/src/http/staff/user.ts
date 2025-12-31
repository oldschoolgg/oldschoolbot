import { isValidDiscordSnowflake } from '@oldschoolgg/util';
import type { DiscordUser } from '@prisma/robochimp';
import { Hono } from 'hono';

import type { AUserIdentity } from '@/http/api-types.js';
import { type HonoServerGeneric, httpErr } from '@/http/serverUtil.js';

export const userServer = new Hono<HonoServerGeneric>();

userServer.get('/identity/:userId', async c => {
	const { userId } = c.req.param();
	if (!isValidDiscordSnowflake(userId)) {
		return httpErr.BAD_REQUEST({ message: 'Invalid user ID. Must be a valid Discord snowflake' });
	}

	let user: DiscordUser | null = await c.get('prisma').discordUser.findUnique({
		where: { id: userId }
	});

	if (!user) {
		const fetched = await globalClient.fetchUser(userId).catch(() => null);
		if (!fetched) return httpErr.NOT_FOUND({ message: 'User not found' });
		user = await globalClient.upsertDiscordUser(fetched);
	}

	const data: AUserIdentity = {
		user_id: user.id,
		username: user.username!,
		avatar: user.avatar
	};

	c.header('Cache-Control', 'public, max-age=604800, s-maxage=604800');
	return c.json(data);
});
