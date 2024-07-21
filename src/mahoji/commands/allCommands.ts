import { production } from '../../config';
import type { OSBMahojiCommand } from '../lib/util';
import { activitiesCommand } from './activities';
import { adminCommand } from './admin';
import { askCommand } from './ask';
import { bankCommand } from './bank';
import { bingoCommand } from './bingo';
import { bossrecordCommand } from './bossrecords';
import { botLeaguesCommand } from './botleagues';
import { bsCommand } from './bs';
import { buildCommand } from './build';
import { buyCommand } from './buy';
import { caCommand } from './ca';
import { casketCommand } from './casket';
import { chooseCommand } from './choose';
import { chopCommand } from './chop';
import { collectionLogCommand } from './cl';
import { claimCommand } from './claim';
import { clueCommand } from './clue';
import { cluesCommand } from './clues';
import { configCommand } from './config';
import { cookCommand } from './cook';
import { craftCommand } from './craft';
import { createCommand } from './create';
import { dataCommand } from './data';
import { dropCommand } from './drop';
import { dryCalcCommand } from './drycalc';
import { fakeCommand } from './fake';
import { fakepmCommand } from './fakepm';
import { farmingCommand } from './farming';
import { finishCommand } from './finish';
import { fishCommand } from './fish';
import { fletchCommand } from './fletch';
import { gambleCommand } from './gamble';
import { geCommand } from './ge';
import { gearCommand } from './gear';
import { gearPresetsCommand } from './gearpresets';
import { giftCommand } from './gift';
import { giveawayCommand } from './giveaway';
import { gpCommand } from './gp';
import { helpCommand } from './help';
import { huntCommand } from './hunt';
import { inviteCommand } from './invite';
import { minionKCommand } from './k';
import { kcCommand } from './kc';
import { killCommand } from './kill';
import { lapsCommand } from './laps';
import { leaderboardCommand } from './leaderboard';
import { lightCommand } from './light';
import { lootCommand } from './loot';
import { lvlCommand } from './lvl';
import { mCommand } from './m';
import { massCommand } from './mass';
import { mineCommand } from './mine';
import { minigamesCommand } from './minigames';
import { minionCommand } from './minion';
import { mixCommand } from './mix';
import { offerCommand } from './offer';
import { openCommand } from './open';
import { patreonCommand } from './patreon';
import { payCommand } from './pay';
import { pohCommand } from './poh';
import { pollCommand } from './poll';
import { priceCommand } from './price';
import { raidCommand } from './raid';
import { redeemCommand } from './redeem';
import { rollCommand } from './roll';
import { rpCommand } from './rp';
import { runecraftCommand } from './runecraft';
import { sacrificeCommand } from './sacrifice';
import { sellCommand } from './sell';
import { simulateCommand } from './simulate';
import { slayerCommand } from './slayer';
import { smeltingCommand } from './smelt';
import { smithCommand } from './smith';
import { statsCommand } from './stats';
import { stealCommand } from './steal';
import { testPotatoCommand } from './testpotato';
import { tksCommand } from './tokkulshop';
import { toolsCommand } from './tools';
import { tradeCommand } from './trade';
import { triviaCommand } from './trivia';
import { mahojiUseCommand } from './use';
import { wikiCommand } from './wiki';
import { xpCommand } from './xp';

export const allCommands: OSBMahojiCommand[] = [
	adminCommand,
	askCommand,
	botLeaguesCommand,
	bsCommand,
	buildCommand,
	buyCommand,
	caCommand,
	chooseCommand,
	chopCommand,
	cookCommand,
	clueCommand,
	configCommand,
	claimCommand,
	cluesCommand,
	mCommand,
	gpCommand,
	payCommand,
	craftCommand,
	fishCommand,
	farmingCommand,
	dropCommand,
	dryCalcCommand,
	createCommand,
	activitiesCommand,
	dataCommand,
	fakeCommand,
	fakepmCommand,
	fletchCommand,
	gambleCommand,
	gearCommand,
	giveawayCommand,
	helpCommand,
	huntCommand,
	giftCommand,
	inviteCommand,
	kcCommand,
	minionKCommand,
	lapsCommand,
	leaderboardCommand,
	lightCommand,
	mineCommand,
	massCommand,
	minigamesCommand,
	minionCommand,
	simulateCommand,
	sellCommand,
	sacrificeCommand,
	rollCommand,
	runecraftCommand,
	raidCommand,
	pollCommand,
	pohCommand,
	priceCommand,
	openCommand,
	offerCommand,
	mixCommand,
	lootCommand,
	smeltingCommand,
	slayerCommand,
	redeemCommand,
	patreonCommand,
	smithCommand,
	stealCommand,
	tradeCommand,
	triviaCommand,
	toolsCommand,
	tksCommand,
	mahojiUseCommand,
	bingoCommand,
	bankCommand,
	bossrecordCommand,
	wikiCommand,
	lvlCommand,
	casketCommand,
	finishCommand,
	killCommand,
	geCommand,
	rpCommand,
	collectionLogCommand,
	gearPresetsCommand,
	statsCommand,
	xpCommand
];

if (!production && testPotatoCommand) {
	allCommands.push(testPotatoCommand);
}

const names = new Set<string>();
for (const cmd of allCommands) {
	if (names.has(cmd.name)) {
		throw new Error(`Duplicate command name: ${cmd.name}`);
	}
	names.add(cmd.name);
}
