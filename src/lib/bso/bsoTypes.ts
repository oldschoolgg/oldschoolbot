import type { Kibble } from '@/lib/bso/kibble.js';
import type { BathhouseTierName } from '@/lib/bso/minigames/baxtorianBathhouses.js';
import type { Monkey } from '@/lib/bso/minigames/monkey-rumble/monkeyRumble.js';
import type { TuraelsTrialsMethod } from '@/lib/bso/minigames/turaelsTrials.js';
import type { IMaterialBank, MaterialType } from '@/lib/bso/skills/invention/index.js';
import type { BossUser } from '@/lib/bso/structures/Boss.js';

import type { ItemBank } from 'oldschooljs';

import type { MinigameName } from '@/lib/settings/minigames.js';
import type { ActivityTaskOptions, MinigameActivityTaskOptions, NexTaskOptions } from '@/lib/types/minions.js';

export interface MoktangTaskOptions extends ActivityTaskOptions {
	type: 'Moktang';
	qty: number;
}

export interface DungeoneeringOptions extends ActivityTaskOptions {
	type: 'Dungeoneering';
	leader: string;
	users: string[];
	quantity: number;
	floor: number;
}

export interface DisassembleTaskOptions extends ActivityTaskOptions {
	type: 'Disassembling';
	i: number;
	qty: number;
	mats: IMaterialBank;
	xp: number;
}

export interface ResearchTaskOptions extends ActivityTaskOptions {
	type: 'Research';
	material: MaterialType;
	quantity: number;
}

export interface BathhouseTaskOptions extends MinigameActivityTaskOptions {
	type: 'BaxtorianBathhouses';
	mixture: string;
	ore: number;
	tier: BathhouseTierName;
}

export interface MortimerOptions extends ActivityTaskOptions {
	type: 'Mortimer';
}

export interface MemoryHarvestOptions extends ActivityTaskOptions {
	type: 'MemoryHarvest';
	e: number;
	t: number;
	wb: boolean;
	dh: boolean;
	dp: boolean;
	r: number;
}

export interface SnoozeSpellActiveCastOptions extends ActivityTaskOptions {
	type: 'SnoozeSpellActive';
	hours: number;
}

export interface DOAStoredRaid {
	wipedRoom: number | null;
	users: { deaths: number[] }[];
}

export interface DOAOptions extends ActivityTaskOptions {
	users: string[];
	maxSizeInput?: number;
	type: 'DepthsOfAtlantis';
	leader: string;
	cm: boolean;
	fakeDuration: number;
	quantity: number;
	raids: DOAStoredRaid[];
	// id of user that used chincannon
	cc?: string;
}

export interface KibbleOptions extends ActivityTaskOptions {
	type: 'KibbleMaking';
	quantity: number;
	kibbleType: Kibble['type'];
}

export interface TuraelsTrialsOptions extends ActivityTaskOptions {
	type: 'TuraelsTrials';
	minigameID: MinigameName;
	q: number;
	m: TuraelsTrialsMethod;
}

export interface MonkeyRumbleOptions extends MinigameActivityTaskOptions {
	type: 'MonkeyRumble';
	quantity: number;
	monkeys: Monkey[];
}

export interface FishingContestOptions extends MinigameActivityTaskOptions {
	type: 'FishingContest';
	quantity: number;
	location: number;
}

export interface TinkeringWorkshopOptions extends MinigameActivityTaskOptions {
	type: 'TinkeringWorkshop';
	material: MaterialType;
}
interface StoredBossUser extends Omit<BossUser, 'user' | 'itemsToRemove'> {
	user: string;
	itemsToRemove: ItemBank;
}

export interface NewBossOptions extends ActivityTaskOptions {
	type: 'VasaMagus' | 'Ignecarus' | 'KingGoldemar' | 'BossEvent';
	users: string[];
	quantity: number;
	bossUsers: StoredBossUser[];
	bossID: number;
}

export type BSOActivityTaskData =
	| MoktangTaskOptions
	| DungeoneeringOptions
	| DisassembleTaskOptions
	| ResearchTaskOptions
	| BathhouseTaskOptions
	| MortimerOptions
	| MemoryHarvestOptions
	| SnoozeSpellActiveCastOptions
	| DOAOptions
	| KibbleOptions
	| TuraelsTrialsOptions
	| MonkeyRumbleOptions
	| FishingContestOptions
	| TinkeringWorkshopOptions
	| NewBossOptions
	| NexTaskOptions;
