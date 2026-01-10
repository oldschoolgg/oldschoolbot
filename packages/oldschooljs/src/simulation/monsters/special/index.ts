import type { Monster } from '@/structures/Monster.js';
import { Barrows } from './Barrows.js';
import { Hespori } from './Hespori.js';
import { MoonsofPeril } from './MoonsofPeril.js';
import { TzKalZuk } from './TzKalZuk.js';
import { TzTokJad } from './TzTokJad.js';

export const specialBosses: Record<string, Monster> = { Barrows, TzTokJad, Hespori, TzKalZuk, MoonsofPeril };
