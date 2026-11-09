import { Hono } from 'hono';

import type { HonoServerGeneric } from '@/http/serverUtil.js';

export const userServer = new Hono<HonoServerGeneric>();
