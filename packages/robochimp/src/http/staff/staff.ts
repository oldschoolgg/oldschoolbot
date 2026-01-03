import { Hono } from 'hono';

import { ensureAuthenticated, ensureModeratorUser } from '@/http/middlewares.js';
import type { HonoServerGeneric } from '@/http/serverUtil.js';
import { staffBotServer } from '@/http/staff/bots.js';
import { economyTransactionServer } from '@/http/staff/economyTransactions.js';
import { userServer } from '@/http/staff/user.js';

export const staffServer = new Hono<HonoServerGeneric>();
staffServer.use(ensureAuthenticated);
staffServer.use(ensureModeratorUser);

staffServer.route('/economy-transactions', economyTransactionServer);
staffServer.route('/user', userServer);
staffServer.route('/bots', staffBotServer);
