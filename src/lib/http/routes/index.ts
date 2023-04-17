import type { FastifyServer } from '../types';
import { commandsRoute } from './commands';
import root from './root';

export const initRoutes = (server: FastifyServer) => [root, commandsRoute].map(route => route(server));
