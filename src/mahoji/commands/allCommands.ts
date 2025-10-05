import { globalConfig } from '@/lib/constants.js';
import { activitiesCommand } from '@/mahoji/commands/activities.js';
import { adminCommand } from '@/mahoji/commands/admin.js';
import { askCommand } from '@/mahoji/commands/ask.js';
import { bankCommand } from '@/mahoji/commands/bank.js';
import { bingoCommand } from '@/mahoji/commands/bingo.js';
import { bsCommand } from '@/mahoji/commands/bs.js';
import { bsoMinigamesCommand } from '@/mahoji/commands/bsominigames.js';
import { buildCommand } from '@/mahoji/commands/build.js';
import { buyCommand } from '@/mahoji/commands/buy.js';
import { caCommand } from '@/mahoji/commands/ca.js';
import { casketCommand } from '@/mahoji/commands/casket.js';
import { chooseCommand } from '@/mahoji/commands/choose.js';
import { chopCommand } from '@/mahoji/commands/chop.js';
import { collectionLogCommand } from '@/mahoji/commands/cl.js';
import { claimCommand } from '@/mahoji/commands/claim.js';
import { clueCommand } from '@/mahoji/commands/clue.js';
import { completionCommand } from '@/mahoji/commands/completion.js';
import { configCommand } from '@/mahoji/commands/config.js';
import { cookCommand } from '@/mahoji/commands/cook.js';
import { craftCommand } from '@/mahoji/commands/craft.js';
import { createCommand } from '@/mahoji/commands/create.js';
import { dataCommand } from '@/mahoji/commands/data.js';
import { dgCommand } from '@/mahoji/commands/dg.js';
import { divinationCommand } from '@/mahoji/commands/divination.js';
import { dropCommand } from '@/mahoji/commands/drop.js';
import { dropRatesCommand } from '@/mahoji/commands/droprates.js';
import { farmingCommand } from '@/mahoji/commands/farming.js';
import { finishCommand } from '@/mahoji/commands/finish.js';
import { fishCommand } from '@/mahoji/commands/fish.js';
import { fletchCommand } from '@/mahoji/commands/fletch.js';
import { gambleCommand } from '@/mahoji/commands/gamble.js';
import { geCommand } from '@/mahoji/commands/ge.js';
import { gearCommand } from '@/mahoji/commands/gear.js';
import { gearPresetsCommand } from '@/mahoji/commands/gearpresets.js';
import { giftCommand } from '@/mahoji/commands/gift.js';
import { giveawayCommand } from '@/mahoji/commands/giveaway.js';
import { gpCommand } from '@/mahoji/commands/gp.js';
import { helpCommand } from '@/mahoji/commands/help.js';
import { huntCommand } from '@/mahoji/commands/hunt.js';
import { icCommand } from '@/mahoji/commands/ic.js';
import { inventionCommand } from '@/mahoji/commands/invention.js';
import { inviteCommand } from '@/mahoji/commands/invite.js';
import { minionKCommand } from '@/mahoji/commands/k.js';
import { kibbleCommand } from '@/mahoji/commands/kibble.js';
import { killCommand } from '@/mahoji/commands/kill.js';
import { lapsCommand } from '@/mahoji/commands/laps.js';
import { leaderboardCommand } from '@/mahoji/commands/leaderboard.js';
import { bsoLeaguesCommand } from '@/mahoji/commands/leagues.js';
import { lightCommand } from '@/mahoji/commands/light.js';
import { lootCommand } from '@/mahoji/commands/loot.js';
import { lotteryCommand } from '@/mahoji/commands/lottery.js';
import { mCommand } from '@/mahoji/commands/m.js';
import { massCommand } from '@/mahoji/commands/mass.js';
import { megaDuckCommand } from '@/mahoji/commands/megaduck.js';
import { mineCommand } from '@/mahoji/commands/mine.js';
import { minigamesCommand } from '@/mahoji/commands/minigames.js';
import { minionCommand } from '@/mahoji/commands/minion.js';
import { mixCommand } from '@/mahoji/commands/mix.js';
import { nurseryCommand } from '@/mahoji/commands/nursery.js';
import { offerCommand } from '@/mahoji/commands/offer.js';
import { openCommand } from '@/mahoji/commands/open.js';
import { paintCommand } from '@/mahoji/commands/paint.js';
import { patreonCommand } from '@/mahoji/commands/patreon.js';
import { payCommand } from '@/mahoji/commands/pay.js';
import { pohCommand } from '@/mahoji/commands/poh.js';
import { pollCommand } from '@/mahoji/commands/poll.js';
import { priceCommand } from '@/mahoji/commands/price.js';
import { raidCommand } from '@/mahoji/commands/raid.js';
import { ratesCommand } from '@/mahoji/commands/rates.js';
import { redeemCommand } from '@/mahoji/commands/redeem.js';
import { rollCommand } from '@/mahoji/commands/roll.js';
import { rpCommand } from '@/mahoji/commands/rp.js';
import { runecraftCommand } from '@/mahoji/commands/runecraft.js';
import { sacrificeCommand } from '@/mahoji/commands/sacrifice.js';
import { sellCommand } from '@/mahoji/commands/sell.js';
import { simulateCommand } from '@/mahoji/commands/simulate.js';
import { slayerCommand } from '@/mahoji/commands/slayer.js';
import { smeltingCommand } from '@/mahoji/commands/smelt.js';
import { smithCommand } from '@/mahoji/commands/smith.js';
import { stealCommand } from '@/mahoji/commands/steal.js';
import { tamesCommand } from '@/mahoji/commands/tames.js';
import { testerShopCommand } from '@/mahoji/commands/testershop.js';
import { testPotatoCommand } from '@/mahoji/commands/testpotato.js';
import { tksCommand } from '@/mahoji/commands/tokkulshop.js';
import { toolsCommand } from '@/mahoji/commands/tools.js';
import { tradeCommand } from '@/mahoji/commands/trade.js';
import { triviaCommand } from '@/mahoji/commands/trivia.js';
import { mahojiUseCommand } from '@/mahoji/commands/use.js';

export const allCommandsDONTIMPORT: OSBMahojiCommand[] = [
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
	allCommandsDONTIMPORT.push(testPotatoCommand);
}

const names = new Set<string>();
for (const cmd of allCommandsDONTIMPORT) {
	if (names.has(cmd.name)) {
		throw new Error(`Duplicate command name: ${cmd.name}`);
	}
	names.add(cmd.name);
}
