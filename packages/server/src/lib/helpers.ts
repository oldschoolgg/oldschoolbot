import { getConnInfo } from '@hono/node-server/conninfo';
import type { Context, MiddlewareHandler } from 'hono';

export type HonoServerGeneric = { Bindings: {}; Variables: {} };

export const Err = {
	UNAUTHORIZED: ({ message }: { message?: string } = {}): Response => {
		return Response.json({ error: 'UNAUTHORIZED', message }, { status: 401 });
	},
	BAD_REQUEST: ({ message }: { message?: string } = {}): Response => {
		return Response.json({ error: 'BAD_REQUEST', message }, { status: 400 });
	},
	NOT_FOUND: ({ message }: { message?: string } = {}): Response => {
		return Response.json({ error: 'NOT_FOUND', message }, { status: 404 });
	},
	RATELIMITED: ({ message }: { message?: string } = {}): Response => {
		return Response.json({ error: 'RATELIMITED', message }, { status: 429 });
	}
};

export const Res = {
	JSON: (json: object): Response => {
		return Response.json(json, { status: 200 });
	}
};

export const simpleCache = (ms: number): MiddlewareHandler => {
	const seconds = Math.floor(ms / 1000);
	const value = `public, max-age=${seconds}, s-maxage=${seconds}`;
	const allowedMethods = ['GET', 'HEAD'];

	return async (c, next) => {
		await next();
		if (c.res.status === 200 && allowedMethods.includes(c.req.method)) {
			c.header('Cache-Control', value);
		}
	};
};

export const basicKeyGenerator = (c: Context): string => {
	const ip = c.req.header('Cf-Connecting-Ip') ?? getConnInfo(c)?.remote?.address ?? c.req.header('User-Agent')!;
	return ip;
};

export const ratelimitHandler = async () => {
	return Err.RATELIMITED({ message: 'You are being rate limited. Please try again later.' });
};
