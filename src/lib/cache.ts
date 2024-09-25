import type { PerkTier } from '@oldschoolgg/toolkit/util';
import type { User } from '@prisma/client';

export const perkTierCache = new Map<string, 0 | PerkTier>();

export type PartialUser = Pick<User, 'bitfield' | 'badges' | 'minion_hasBought'>;
export const partialUserCache = new Map<string, PartialUser>();
