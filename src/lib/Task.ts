import { activity_type_enum } from '@prisma/client';

import { agilityTask } from '../tasks/minions/agilityActivity';
import { alchingTask } from '../tasks/minions/alchingActivity';
import { castingTask } from '../tasks/minions/castingActivity';
import { clueTask } from '../tasks/minions/clueActivity';
import { collectingTask } from '../tasks/minions/collectingActivity';
import { constructionTask } from '../tasks/minions/constructionActivity';
import { cookingTask } from '../tasks/minions/cookingActivity';
import { craftingTask } from '../tasks/minions/craftingActivity';
import { darkAltarTask } from '../tasks/minions/darkAltarActivity';
import { enchantingTask } from '../tasks/minions/enchantingActivity';
import { farmingTask } from '../tasks/minions/farmingActivity';
import { firemakingTask } from '../tasks/minions/firemakingActivity';
import { fishingTask } from '../tasks/minions/fishingActivity';
import { fletchingTask } from '../tasks/minions/fletchingActivity';
import { gloryChargingTask } from '../tasks/minions/gloryChargingActivity';
import { groupoMonsterTask } from '../tasks/minions/groupMonsterActivity';
import { herbloreTask } from '../tasks/minions/herbloreActivity';
import { aerialFishingTask } from '../tasks/minions/HunterActivity/aerialFishingActivity';
import { birdHouseTask } from '../tasks/minions/HunterActivity/birdhouseActivity';
import { driftNetTask } from '../tasks/minions/HunterActivity/driftNetActivity';
import { hunterTask } from '../tasks/minions/HunterActivity/hunterActivity';
import { mageArenaTwoTask } from '../tasks/minions/mageArena2Activity';
import { mageArenaTask } from '../tasks/minions/mageArenaActivity';
import { agilityArenaTask } from '../tasks/minions/minigames/agilityArenaActivity';
import { barbAssaultTask } from '../tasks/minions/minigames/barbarianAssaultActivity';
import { castleWarsTask } from '../tasks/minions/minigames/castleWarsActivity';
import { championsChallengeTask } from '../tasks/minions/minigames/championsChallengeActivity';
import { chompHuntTask } from '../tasks/minions/minigames/chompyHuntActivity';
import { fightCavesTask } from '../tasks/minions/minigames/fightCavesActivity';
import { gauntletTask } from '../tasks/minions/minigames/gauntletActivity';
import { gnomeResTask } from '../tasks/minions/minigames/gnomeRestaurantActivity';
import { infernoTask } from '../tasks/minions/minigames/infernoActivity';
import { lmsTask } from '../tasks/minions/minigames/lmsActivity';
import { mahoganyHomesTask } from '../tasks/minions/minigames/mahoganyHomesActivity';
import { nightmareTask } from '../tasks/minions/minigames/nightmareActivity';
import { pestControlTask } from '../tasks/minions/minigames/pestControlActivity';
import { plunderTask } from '../tasks/minions/minigames/plunderActivity';
import { puroPuroTask } from '../tasks/minions/minigames/puroPuroActivity';
import { raidsTask } from '../tasks/minions/minigames/raidsActivity';
import { roguesDenTask } from '../tasks/minions/minigames/roguesDenMazeActivity';
import { soulWarsTask } from '../tasks/minions/minigames/soulWarsActivity';
import { togTask } from '../tasks/minions/minigames/tearsOfGuthixActivity';
import { tobTask } from '../tasks/minions/minigames/tobActivity';
import { trawlerTask } from '../tasks/minions/minigames/trawlerActivity';
import { brewingTask } from '../tasks/minions/minigames/troubleBrewingActivity';
import { animatedArmorTask } from '../tasks/minions/minigames/warriorsGuild/animatedArmourActivity';
import { cyclopsTask } from '../tasks/minions/minigames/warriorsGuild/cyclopsActivity';
import { wintertodtTask } from '../tasks/minions/minigames/wintertodtActivity';
import { zalcanoTask } from '../tasks/minions/minigames/zalcanoActivity';
import { miningTask } from '../tasks/minions/miningActivity';
import { monsterTask } from '../tasks/minions/monsterActivity';
import { nexTask } from '../tasks/minions/nexActivity';
import { pickpocketTask } from '../tasks/minions/pickpocketActivity';
import { buryingTask } from '../tasks/minions/PrayerActivity/buryingActivity';
import { offeringTask } from '../tasks/minions/PrayerActivity/offeringActivity';
import { questingTask } from '../tasks/minions/questingActivity';
import { revenantsTask } from '../tasks/minions/revenantsActivity';
import { runecraftTask } from '../tasks/minions/runecraftActivity';
import { sawmillTask } from '../tasks/minions/sawmillActivity';
import { smeltingTask } from '../tasks/minions/smeltingActivity';
import { tokkulShopTask } from '../tasks/minions/tokkulShopActivity';
import { wealthChargeTask } from '../tasks/minions/wealthChargingActivity';
import { woodcuttingTask } from '../tasks/minions/woodcuttingActivity';

export const tasks: MinionTask[] = [
	aerialFishingTask,
	birdHouseTask,
	driftNetTask,
	hunterTask,
	animatedArmorTask,
	cyclopsTask,
	agilityArenaTask,
	barbAssaultTask,
	castleWarsTask,
	championsChallengeTask,
	chompHuntTask,
	fightCavesTask,
	gauntletTask,
	gnomeResTask,
	infernoTask,
	lmsTask,
	mageArenaTask,
	mageArenaTwoTask,
	mahoganyHomesTask,
	nightmareTask,
	pestControlTask,
	plunderTask,
	puroPuroTask,
	raidsTask,
	tobTask,
	togTask,
	trawlerTask,
	brewingTask,
	roguesDenTask,
	soulWarsTask,
	wintertodtTask,
	zalcanoTask,
	buryingTask,
	offeringTask,
	agilityTask,
	alchingTask,
	castingTask,
	clueTask,
	collectingTask,
	constructionTask,
	cookingTask,
	craftingTask,
	darkAltarTask,
	enchantingTask,
	farmingTask,
	firemakingTask,
	fishingTask,
	fletchingTask,
	gloryChargingTask,
	groupoMonsterTask,
	herbloreTask,
	fletchingTask,
	miningTask,
	runecraftTask,
	sawmillTask,
	revenantsTask,
	woodcuttingTask,
	wealthChargeTask,
	tokkulShopTask,
	smeltingTask,
	nexTask,
	pickpocketTask,
	questingTask,
	monsterTask
];

export interface MinionTask {
	type: activity_type_enum;
	run: Function;
}

for (const a of Object.values(activity_type_enum)) {
	const t = tasks.find(i => i.type === a);
	if (!t) {
		console.log(a);
	}
}
