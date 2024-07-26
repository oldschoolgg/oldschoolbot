import { globalConfig } from '../constants';

export const CACHED_ACTIVE_USER_IDS = new Set();
CACHED_ACTIVE_USER_IDS.add(globalConfig.clientID);
