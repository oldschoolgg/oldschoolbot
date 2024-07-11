import { globalConfig } from '../../lib/constants';
import type { OSBMahojiCommand } from '../lib/util';
import { activitiesCommand } from './activities';
import { adminCommand } from './admin';
import { bankCommand } from './bank';
import { bsCommand } from './bs';
import { bsoMinigamesCommand } from './bsominigames';
import { buildCommand } from './build';
import { buyCommand } from './buy';
import { caCommand } from './ca';
import { chopCommand } from './chop';
import { collectionLogCommand } from './cl';
import { clueCommand } from './clue';
import { completionCommand } from './completion';
import { configCommand } from './config';
import { cookCommand } from './cook';
import { craftCommand } from './craft';
import { createCommand } from './create';
import { dataCommand } from './data';
import { dgCommand } from './dg';
import { divinationCommand } from './divination';
import { dropCommand } from './drop';
import { farmingCommand } from './farming';
import { fishCommand } from './fish';
import { fletchCommand } from './fletch';
import { gearCommand } from './gear';
import { gpCommand } from './gp';
import { huntCommand } from './hunt';
import { inventionCommand } from './invention';
import { minionKCommand } from './k';
import { kibbleCommand } from './kibble';
import { lapsCommand } from './laps';
import { leaderboardCommand } from './leaderboard';
import { lightCommand } from './light';
import { mCommand } from './m';
import { mineCommand } from './mine';
import { minigamesCommand } from './minigames';
import { minionCommand } from './minion';
import { mixCommand } from './mix';
import { nurseryCommand } from './nursery';
import { offerCommand } from './offer';
import { openCommand } from './open';
import { paintCommand } from './paint';
import { pohCommand } from './poh';
import { raidCommand } from './raid';
import { randomizerCommand } from './randomizer';

import { rpCommand } from './rp';
import { runecraftCommand } from './runecraft';
import { sacrificeCommand } from './sacrifice';
import { sellCommand } from './sell';
import { slayerCommand } from './slayer';
import { smeltingCommand } from './smelt';
import { smithCommand } from './smith';
import { stealCommand } from './steal';
import { tamesCommand } from './tames';
import { testPotatoCommand } from './testpotato';
import { tksCommand } from './tokkulshop';
import { toolsCommand } from './tools';
import { mahojiUseCommand } from './use';

export const allCommands: OSBMahojiCommand[] = [
	adminCommand,
	bsCommand,
	buildCommand,
	buyCommand,
	caCommand,
	chopCommand,
	cookCommand,
	clueCommand,
	configCommand,
	mCommand,
	gpCommand,
	craftCommand,
	fishCommand,
	farmingCommand,
	dropCommand,
	createCommand,
	activitiesCommand,
	dataCommand,
	fletchCommand,
	gearCommand,
	huntCommand,
	minionKCommand,
	lapsCommand,
	leaderboardCommand,
	lightCommand,
	mineCommand,
	minigamesCommand,
	minionCommand,
	sellCommand,
	sacrificeCommand,
	runecraftCommand,
	raidCommand,
	pohCommand,
	openCommand,
	offerCommand,
	mixCommand,
	smeltingCommand,
	slayerCommand,
	smithCommand,
	stealCommand,
	toolsCommand,
	tksCommand,
	mahojiUseCommand,
	bankCommand,
	rpCommand,
	collectionLogCommand,
	bsoMinigamesCommand,
	completionCommand,
	dgCommand,
	divinationCommand,
	inventionCommand,
	kibbleCommand,
	nurseryCommand,
	paintCommand,
	tamesCommand,
	randomizerCommand
];

if (!globalConfig.isProduction && testPotatoCommand) {
	allCommands.push(testPotatoCommand);
}

const names = new Set<string>();
for (const cmd of allCommands) {
	if (names.has(cmd.name)) {
		throw new Error(`Duplicate command name: ${cmd.name}`);
	}
	names.add(cmd.name);
}
