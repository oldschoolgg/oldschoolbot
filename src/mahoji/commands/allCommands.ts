import { bsoMinigamesCommand } from '@/lib/bso/commands/bsominigames.js';
import { completionCommand } from '@/lib/bso/commands/completion.js';
import { dgCommand } from '@/lib/bso/commands/dg.js';
import { divinationCommand } from '@/lib/bso/commands/divination.js';
import { dropRatesCommand } from '@/lib/bso/commands/droprates.js';
import { halloweenCommand } from '@/lib/bso/commands/halloween.js';
import { icCommand } from '@/lib/bso/commands/ic.js';
import { inventionCommand } from '@/lib/bso/commands/invention.js';
import { kibbleCommand } from '@/lib/bso/commands/kibble.js';
import { bsoLeaguesCommand } from '@/lib/bso/commands/leagues.js';
import { lotteryCommand } from '@/lib/bso/commands/lottery.js';
import { megaDuckCommand } from '@/lib/bso/commands/megaduck.js';
import { nurseryCommand } from '@/lib/bso/commands/nursery.js';
import { paintCommand } from '@/lib/bso/commands/paint.js';
import { ratesCommand } from '@/lib/bso/commands/rates.js';
import { tamesCommand } from '@/lib/bso/commands/tames.js';
import { testerShopCommand } from '@/lib/bso/commands/testershop.js';

import { globalConfig } from '@/lib/constants.js';
import type { AnyCommand } from '@/lib/discord/index.js';
import { activitiesCommand } from '@/mahoji/commands/activities.js';
import { adminCommand } from '@/mahoji/commands/admin.js';
import { askCommand } from '@/mahoji/commands/ask.js';
import { bankCommand } from '@/mahoji/commands/bank.js';
import { bingoCommand } from '@/mahoji/commands/bingo.js';
import { bsCommand } from '@/mahoji/commands/bs.js';
import { buildCommand } from '@/mahoji/commands/build.js';
import { buyCommand } from '@/mahoji/commands/buy.js';
import { caCommand } from '@/mahoji/commands/ca.js';
import { casketCommand } from '@/mahoji/commands/casket.js';
import { chooseCommand } from '@/mahoji/commands/choose.js';
import { chopCommand } from '@/mahoji/commands/chop.js';
import { collectionLogCommand } from '@/mahoji/commands/cl.js';
import { claimCommand } from '@/mahoji/commands/claim.js';
import { clueCommand } from '@/mahoji/commands/clue.js';
import { configCommand } from '@/mahoji/commands/config.js';
import { cookCommand } from '@/mahoji/commands/cook.js';
import { craftCommand } from '@/mahoji/commands/craft.js';
import { createCommand } from '@/mahoji/commands/create.js';
import { dataCommand } from '@/mahoji/commands/data.js';
import { dropCommand } from '@/mahoji/commands/drop.js';
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
import { inviteCommand } from '@/mahoji/commands/invite.js';
import { minionKCommand } from '@/mahoji/commands/k.js';
import { killCommand } from '@/mahoji/commands/kill.js';
import { lapsCommand } from '@/mahoji/commands/laps.js';
import { leaderboardCommand } from '@/mahoji/commands/leaderboard.js';
import { lightCommand } from '@/mahoji/commands/light.js';
import { lootCommand } from '@/mahoji/commands/loot.js';
import { mCommand } from '@/mahoji/commands/m.js';
import { massCommand } from '@/mahoji/commands/mass.js';
import { mineCommand } from '@/mahoji/commands/mine.js';
import { minigamesCommand } from '@/mahoji/commands/minigames.js';
import { minionCommand } from '@/mahoji/commands/minion.js';
import { mixCommand } from '@/mahoji/commands/mix.js';
import { offerCommand } from '@/mahoji/commands/offer.js';
import { openCommand } from '@/mahoji/commands/open.js';
import { patreonCommand } from '@/mahoji/commands/patreon.js';
import { payCommand } from '@/mahoji/commands/pay.js';
import { pohCommand } from '@/mahoji/commands/poh.js';
import { pollCommand } from '@/mahoji/commands/poll.js';
import { priceCommand } from '@/mahoji/commands/price.js';
import { raidCommand } from '@/mahoji/commands/raid.js';
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
import { testPotatoCommand } from '@/mahoji/commands/testpotato.js';
import { tksCommand } from '@/mahoji/commands/tokkulshop.js';
import { toolsCommand } from '@/mahoji/commands/tools.js';
import { tradeCommand } from '@/mahoji/commands/trade.js';
import { triviaCommand } from '@/mahoji/commands/trivia.js';
import { mahojiUseCommand } from '@/mahoji/commands/use.js';

export const allCommandsDONTIMPORT: AnyCommand[] = [
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
	bsoLeaguesCommand,
	halloweenCommand
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
