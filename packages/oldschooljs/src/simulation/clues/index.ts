import type LootTable from '@/structures/LootTable.js';
import { BeginnerCasket as Beginner } from './Beginner.js';
import { EasyCasket as Easy } from './Easy.js';
import { EliteCasket as Elite } from './Elite.js';
import { HardCasket as Hard } from './Hard.js';
import { MasterCasket as Master } from './Master.js';
import { MediumCasket as Medium } from './Medium.js';

export const Clues: Record<string, LootTable> = {
	Beginner,
	Easy,
	Elite,
	Hard,
	Master,
	Medium
};

export * from './Beginner.js';
export * from './Easy.js';
export * from './Elite.js';
export * from './Hard.js';
export * from './Master.js';
export * from './Medium.js';
