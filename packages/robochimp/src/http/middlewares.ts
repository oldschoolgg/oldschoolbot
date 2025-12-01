import type { MiddlewareHandler } from 'hono';
import { deleteCookie, getCookie } from 'hono/cookie';

import { globalConfig } from '@/constants.js';
import { type HonoServerGeneric, httpErr } from '@/http/serverUtil.js';
import { handleAuthenticationFromToken } from '@/modules/encryption.js';
import { Bits } from '@/util.js';

export const ensureAuthenticated: MiddlewareHandler = async (c, next) => {
	const user = c.get('user');

	if (!user) {
		return httpErr.UNAUTHORIZED();
	}

	await next();
};

export const ensureModeratorUser: MiddlewareHandler<HonoServerGeneric> = async (c, next) => {
	const user = c.get('user');

	if (!user) {
		return httpErr.UNAUTHORIZED();
	}

	if (!user.bits.includes(Bits.Mod) && !user.bits.includes(Bits.Admin)) {
		return httpErr.UNAUTHORIZED();
	}

	await next();
};

export const attachUser: MiddlewareHandler = async (c, next) => {
	const authCookie = getCookie(c, 'token');
	if (authCookie) {
		const user: RUser | null = await handleAuthenticationFromToken(authCookie).catch(_err => {
			deleteCookie(c, 'token', {
				httpOnly: true,
				secure: true,
				domain: globalConfig.cookieOrigin,
				sameSite: 'lax',
				path: '/'
			});
			return null;
		});
		c.set('user', user);
	}

	await next();
};
