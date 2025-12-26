import type { SimpleMonster } from '@/structures/Monster.js';
import { AbyssalSire } from './AbyssalSire.js';
import { AlchemicalHydra } from './AlchemicalHydra.js';
import { Cerberus } from './Cerberus.js';
import { GrotesqueGuardians } from './GrotesqueGuardians.js';
import { Kraken } from './Kraken.js';
import { ThermonuclearSmokeDevil } from './ThermonuclearSmokeDevil.js';

export const allSlayerBosses: Record<string, SimpleMonster> = {
	AbyssalSire,
	Cerberus,
	AlchemicalHydra,
	GrotesqueGuardians,
	ThermonuclearSmokeDevil,
	Kraken
};
