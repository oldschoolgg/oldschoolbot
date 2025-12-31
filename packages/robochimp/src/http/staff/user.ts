import { isValidDiscordSnowflake } from '@oldschoolgg/util';
import { Hono } from 'hono';

import type { AUserIdentity } from '@/http/api-types.js';
import { type HonoServerGeneric, httpErr, httpRes } from '@/http/serverUtil.js';

export const userServer = new Hono<HonoServerGeneric>();

userServer.get('/identity/:userId', async c => {
	const { userId } = c.req.param();
	if (!isValidDiscordSnowflake(userId)) {
		return httpErr.BAD_REQUEST({ message: 'Invalid user ID. Must be a valid Discord snowflake' });
	}

	const user = await c.get('prisma').discordUser.findUnique({
		where: { id: userId }
	});

	if (!user) {
		return httpErr.NOT_FOUND({ message: 'User not found' });
	}
	const data: AUserIdentity = {
		user_id: user.id,
		username: user.username!,
		avatar: user.avatar
	};
	return httpRes.JSON(data);
});
