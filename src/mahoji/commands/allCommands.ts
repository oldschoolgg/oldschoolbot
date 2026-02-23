import { globalConfig } from '@/lib/constants.js';
import { activitiesCommand } from '@/mahoji/commands/activities.js';
import { adminCommand } from '@/mahoji/commands/admin.js';
import { askCommand } from '@/mahoji/commands/ask.js';
import { bankCommand } from '@/mahoji/commands/bank.js';
import { bingoCommand } from '@/mahoji/commands/bingo.js';
import { bossrecordCommand } from '@/mahoji/commands/bossrecords.js';
import { botLeaguesCommand } from '@/mahoji/commands/botleagues.js';
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
import { cluesCommand } from '@/mahoji/commands/clues.js';
import { commitCommand } from '@/mahoji/commands/commit.js';
import { configCommand } from '@/mahoji/commands/config.js';
import { cookCommand } from '@/mahoji/commands/cook.js';
import { craftCommand } from '@/mahoji/commands/craft.js';
import { createCommand } from '@/mahoji/commands/create.js';
import { dataCommand } from '@/mahoji/commands/data.js';
import { dropCommand } from '@/mahoji/commands/drop.js';
import { dryCalcCommand } from '@/mahoji/commands/drycalc.js';
import { fakeCommand } from '@/mahoji/commands/fake.js';
import { fakepmCommand } from '@/mahoji/commands/fakepm.js';
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
import { kcCommand } from '@/mahoji/commands/kc.js';
import { killCommand } from '@/mahoji/commands/kill.js';
import { lapsCommand } from '@/mahoji/commands/laps.js';
import { leaderboardCommand } from '@/mahoji/commands/leaderboard.js';
import { lightCommand } from '@/mahoji/commands/light.js';
import { lootCommand } from '@/mahoji/commands/loot.js';
import { lvlCommand } from '@/mahoji/commands/lvl.js';
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
import { statsCommand } from '@/mahoji/commands/stats.js';
import { stealCommand } from '@/mahoji/commands/steal.js';
import { testPotatoCommand } from '@/mahoji/commands/testpotato.js';
import { tksCommand } from '@/mahoji/commands/tokkulshop.js';
import { toolsCommand } from '@/mahoji/commands/tools.js';
import { tradeCommand } from '@/mahoji/commands/trade.js';
import { triviaCommand } from '@/mahoji/commands/trivia.js';
import { mahojiUseCommand } from '@/mahoji/commands/use.js';
import { wikiCommand } from '@/mahoji/commands/wiki.js';
import { xpCommand } from '@/mahoji/commands/xp.js';

export const allCommandsDONTIMPORT: AnyCommand[] = [
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
	commitCommand,
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
