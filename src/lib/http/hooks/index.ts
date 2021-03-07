import { FastifyServer } from '../types';
import { onRoute } from './onRoute';

export const initHooks = (server: FastifyServer) => [onRoute].map(hook => hook(server));
