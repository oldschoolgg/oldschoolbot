import { globalConfig } from '@/lib/constants.js';
import { activitiesCommand } from './activities.js';
import { adminCommand } from './admin.js';
import { askCommand } from './ask.js';
import { bankCommand } from './bank.js';
import { bingoCommand } from './bingo.js';
import { bsCommand } from './bs.js';
import { bsoMinigamesCommand } from './bsominigames.js';
import { buildCommand } from './build.js';
import { buyCommand } from './buy.js';
import { caCommand } from './ca.js';
import { casketCommand } from './casket.js';
import { chooseCommand } from './choose.js';
import { chopCommand } from './chop.js';
import { collectionLogCommand } from './cl.js';
import { claimCommand } from './claim.js';
import { clueCommand } from './clue.js';
import { completionCommand } from './completion.js';
import { configCommand } from './config.js';
import { cookCommand } from './cook.js';
import { craftCommand } from './craft.js';
import { createCommand } from './create.js';
import { dataCommand } from './data.js';
import { dgCommand } from './dg.js';
import { divinationCommand } from './divination.js';
import { dropCommand } from './drop.js';
import { dropRatesCommand } from './droprates.js';
import { farmingCommand } from './farming.js';
import { finishCommand } from './finish.js';
import { fishCommand } from './fish.js';
import { fletchCommand } from './fletch.js';
import { gambleCommand } from './gamble.js';
import { geCommand } from './ge.js';
import { gearCommand } from './gear.js';
import { gearPresetsCommand } from './gearpresets.js';
import { giftCommand } from './gift.js';
import { giveawayCommand } from './giveaway.js';
import { gpCommand } from './gp.js';
import { helpCommand } from './help.js';
import { huntCommand } from './hunt.js';
import { icCommand } from './ic.js';
import { inventionCommand } from './invention.js';
import { inviteCommand } from './invite.js';
import { minionKCommand } from './k.js';
import { kcCommand } from './kc.js';
import { kibbleCommand } from './kibble.js';
import { killCommand } from './kill.js';
import { lapsCommand } from './laps.js';
import { leaderboardCommand } from './leaderboard.js';
import { bsoLeaguesCommand } from './leagues.js';
import { lightCommand } from './light.js';
import { lootCommand } from './loot.js';
import { lotteryCommand } from './lottery.js';
import { mCommand } from './m.js';
import { massCommand } from './mass.js';
import { megaDuckCommand } from './megaduck.js';
import { mineCommand } from './mine.js';
import { minigamesCommand } from './minigames.js';
import { minionCommand } from './minion.js';
import { mixCommand } from './mix.js';
import { nurseryCommand } from './nursery.js';
import { offerCommand } from './offer.js';
import { openCommand } from './open.js';
import { paintCommand } from './paint.js';
import { patreonCommand } from './patreon.js';
import { payCommand } from './pay.js';
import { pohCommand } from './poh.js';
import { pollCommand } from './poll.js';
import { priceCommand } from './price.js';
import { raidCommand } from './raid.js';
import { ratesCommand } from './rates.js';
import { redeemCommand } from './redeem.js';
import { rollCommand } from './roll.js';
import { rpCommand } from './rp.js';
import { runecraftCommand } from './runecraft.js';
import { sacrificeCommand } from './sacrifice.js';
import { sellCommand } from './sell.js';
import { simulateCommand } from './simulate.js';
import { slayerCommand } from './slayer.js';
import { smeltingCommand } from './smelt.js';
import { smithCommand } from './smith.js';
import { stealCommand } from './steal.js';
import { tamesCommand } from './tames.js';
import { testerShopCommand } from './testershop.js';
import { testPotatoCommand } from './testpotato.js';
import { tksCommand } from './tokkulshop.js';
import { toolsCommand } from './tools.js';
import { tradeCommand } from './trade.js';
import { triviaCommand } from './trivia.js';
import { mahojiUseCommand } from './use.js';

export const allCommands: OSBMahojiCommand[] = [
	adminCommand,
	askCommand,
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
	mCommand,
	gpCommand,
	payCommand,
	craftCommand,
	fishCommand,
	farmingCommand,
	dropCommand,
	createCommand,
	activitiesCommand,
	dataCommand,
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
	casketCommand,
	finishCommand,
	killCommand,
	geCommand,
	rpCommand,
	collectionLogCommand,
	gearPresetsCommand,
	bsoMinigamesCommand,
	completionCommand,
	dgCommand,
	divinationCommand,
	dropRatesCommand,
	icCommand,
	inventionCommand,
	kibbleCommand,
	lotteryCommand,
	megaDuckCommand,
	nurseryCommand,
	paintCommand,
	ratesCommand,
	tamesCommand,
	testerShopCommand,
	bsoLeaguesCommand
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
