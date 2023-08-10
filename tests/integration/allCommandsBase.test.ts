import { describe, test, vi } from 'vitest';

import { activitiesCommand } from '../../src/mahoji/commands/activities';
import { askCommand } from '../../src/mahoji/commands/ask';
import { bankCommand } from '../../src/mahoji/commands/bank';
import { bsCommand } from '../../src/mahoji/commands/bs';
import { buildCommand } from '../../src/mahoji/commands/build';
import { buyCommand } from '../../src/mahoji/commands/buy';
import { chooseCommand } from '../../src/mahoji/commands/choose';
import { chopCommand } from '../../src/mahoji/commands/chop';
import { claimCommand } from '../../src/mahoji/commands/claim';
import { clueCommand } from '../../src/mahoji/commands/clue';
import { cluesCommand } from '../../src/mahoji/commands/clues';
import { createCommand } from '../../src/mahoji/commands/create';
import { dryCalcCommand } from '../../src/mahoji/commands/drycalc';
import { farmingCommand } from '../../src/mahoji/commands/farming';
import { fishCommand } from '../../src/mahoji/commands/fish';
import { fletchCommand } from '../../src/mahoji/commands/fletch';
import { gpCommand } from '../../src/mahoji/commands/gp';
import { huntCommand } from '../../src/mahoji/commands/hunt';
import { lapsCommand } from '../../src/mahoji/commands/laps';
import { leaderboardCommand } from '../../src/mahoji/commands/leaderboard';
import { lightCommand } from '../../src/mahoji/commands/light';
import { lootCommand } from '../../src/mahoji/commands/loot';
import { minigamesCommand } from '../../src/mahoji/commands/minigames';
import { minionCommand } from '../../src/mahoji/commands/minion';
import { openCommand } from '../../src/mahoji/commands/open';
import { patreonCommand } from '../../src/mahoji/commands/patreon';
import { payCommand } from '../../src/mahoji/commands/pay';
import { pohCommand } from '../../src/mahoji/commands/poh';
import { priceCommand } from '../../src/mahoji/commands/price';
import { raidCommand } from '../../src/mahoji/commands/raid';
import { rollCommand } from '../../src/mahoji/commands/roll';
import { runecraftCommand } from '../../src/mahoji/commands/runecraft';
import { slayerCommand } from '../../src/mahoji/commands/slayer';
import { smeltingCommand } from '../../src/mahoji/commands/smelt';
import { stealCommand } from '../../src/mahoji/commands/steal';
import { toolsCommand } from '../../src/mahoji/commands/tools';
import { OSBMahojiCommand } from '../../src/mahoji/lib/util';
import { randomMock } from './setup';
import { createTestUser } from './util';

const commands: [OSBMahojiCommand, null | object][] = [
	[activitiesCommand, null],
	[askCommand, null],
	[bankCommand, null],
	[bsCommand, null],
	[clueCommand, null],
	[claimCommand, null],
	[cluesCommand, null],
	[farmingCommand, null],
	[gpCommand, null],
	[lapsCommand, null],
	[leaderboardCommand, null],
	[fletchCommand, null],
	[fishCommand, null],
	[dryCalcCommand, null],
	[createCommand, { item: 'asdf' }],
	[chopCommand, null],
	[chooseCommand, { list: 'a,a,a' }],
	[buildCommand, null],
	[buyCommand, null],
	[huntCommand, null],
	[lightCommand, null],
	[lootCommand, null],
	[minionCommand, null],
	[minigamesCommand, null],
	[runecraftCommand, { rune: 'blood rune' }],
	[stealCommand, null],
	[rollCommand, null],
	[raidCommand, null],
	[priceCommand, null],
	[openCommand, null],
	[patreonCommand, null],
	[payCommand, { user: { user: { id: '2' } } }],
	[pohCommand, null],
	[slayerCommand, null],
	[toolsCommand, null],
	[stealCommand, null],
	[smeltingCommand, null]
];

// Don't let any of these commands create an activity
vi.mock('../../src/lib/util/addSubTaskToActivityTask', async () => {
	const actual: any = await vi.importActual('../../src/lib/util/addSubTaskToActivityTask');
	return {
		...actual,
		default: async (args: any) => {
			console.log(`Sending ${args}`);
		}
	};
});

describe('All Commands Base Test', async () => {
	randomMock();
	const user = await createTestUser();
	for (const [command, options] of commands) {
		test(`Run ${command.name} command`, async () => {
			await user.runCommand(command, options ?? {});
		});
	}
});
