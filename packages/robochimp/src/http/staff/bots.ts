import { ZServiceType } from '@oldschoolgg/schemas';
import { Hono } from 'hono';
import { z } from 'zod';

import { ensureAuthenticated, ensureModeratorUser } from '@/http/middlewares.js';
import { type HonoServerGeneric, httpErr, httpRes } from '@/http/serverUtil.js';
import { serviceManager } from '@/structures/ServiceManager.js';

const serviceSchema = z.object({
	service: ZServiceType
});

export const staffBotServer = new Hono<HonoServerGeneric>();
staffBotServer.use(ensureAuthenticated);
staffBotServer.use(ensureModeratorUser);

staffBotServer.get('/', async () => {
	try {
		const statuses = await serviceManager.statusAll();
		return httpRes.JSON(statuses);
	} catch (error: any) {
		return httpErr.BAD_REQUEST({ message: 'Failed to fetch service statuses' });
	}
});

staffBotServer.post('/start', async c => {
	try {
		const body = await c.req.json();
		const { service } = serviceSchema.parse(body);
		await serviceManager.start(service);
		return httpRes.JSON({ message: `Service ${service} started successfully` });
	} catch (error: any) {
		if (error.name === 'ZodError') {
			return httpErr.BAD_REQUEST({ message: 'Invalid service name' });
		}
		return httpErr.BAD_REQUEST({ message: `Failed to start service` });
	}
});

staffBotServer.post('/stop', async c => {
	try {
		const body = await c.req.json();
		const { service } = serviceSchema.parse(body);
		await serviceManager.stop(service);
		return httpRes.JSON({ message: `Service ${service} stopped successfully` });
	} catch (error: any) {
		if (error.name === 'ZodError') {
			return httpErr.BAD_REQUEST({ message: 'Invalid service name' });
		}
		return httpErr.BAD_REQUEST({ message: `Failed to stop service` });
	}
});

staffBotServer.post('/restart', async c => {
	try {
		const body = await c.req.json();
		const { service } = serviceSchema.parse(body);
		await serviceManager.restart(service);
		return httpRes.JSON({ message: `Service ${service} restarted successfully` });
	} catch (error: any) {
		if (error.name === 'ZodError') {
			return httpErr.BAD_REQUEST({ message: 'Invalid service name' });
		}
		return httpErr.BAD_REQUEST({ message: `Failed to restart service` });
	}
});
