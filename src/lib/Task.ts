import { activity_type_enum } from '@prisma/client';

import type { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { agilityTask } from '@/tasks/minions/agilityActivity.js';
import { alchingTask } from '@/tasks/minions/alchingActivity.js';
import { butlerTask } from '@/tasks/minions/butlerActivity.js';
import { buyTask } from '@/tasks/minions/buyActivity.js';
import { camdozaalFishingTask } from '@/tasks/minions/camdozaalActivity/camdozaalFishingActivity.js';
import { camdozaalMiningTask } from '@/tasks/minions/camdozaalActivity/camdozaalMiningActivity.js';
import { camdozaalSmithingTask } from '@/tasks/minions/camdozaalActivity/camdozaalSmithingActivity.js';
import { castingTask } from '@/tasks/minions/castingActivity.js';
import { clueTask } from '@/tasks/minions/clueActivity.js';
import { collectingTask } from '@/tasks/minions/collectingActivity.js';
import { colosseumTask } from '@/tasks/minions/colosseumActivity.js';
import { combatRingTask } from '@/tasks/minions/combatRingActivity.js';
import { constructionTask } from '@/tasks/minions/constructionActivity.js';
import { cookingTask } from '@/tasks/minions/cookingActivity.js';
import { craftingTask } from '@/tasks/minions/craftingActivity.js';
import { cutLeapingFishTask } from '@/tasks/minions/cutLeapingFishActivity.js';
import { darkAltarTask } from '@/tasks/minions/darkAltarActivity.js';
import { enchantingTask } from '@/tasks/minions/enchantingActivity.js';
import { farmingTask } from '@/tasks/minions/farmingActivity.js';
import { firemakingTask } from '@/tasks/minions/firemakingActivity.js';
import { fishingTask } from '@/tasks/minions/fishingActivity.js';
import { fletchingTask } from '@/tasks/minions/fletchingActivity.js';
import { CreateForestersRationsTask } from '@/tasks/minions/forestersRationActivity.js';
import { gloryChargingTask } from '@/tasks/minions/gloryChargingActivity.js';
import { groupoMonsterTask } from '@/tasks/minions/groupMonsterActivity.js';
import { aerialFishingTask } from '@/tasks/minions/HunterActivity/aerialFishingActivity.js';
import { birdHouseTask } from '@/tasks/minions/HunterActivity/birdhouseActivity.js';
import { driftNetTask } from '@/tasks/minions/HunterActivity/driftNetActivity.js';
import { hunterTask } from '@/tasks/minions/HunterActivity/hunterActivity.js';
import { herbloreTask } from '@/tasks/minions/herbloreActivity.js';
import { mageArenaTwoTask } from '@/tasks/minions/mageArena2Activity.js';
import { mageArenaTask } from '@/tasks/minions/mageArenaActivity.js';
import { agilityArenaTask } from '@/tasks/minions/minigames/agilityArenaActivity.js';
import { barbAssaultTask } from '@/tasks/minions/minigames/barbarianAssaultActivity.js';
import { castleWarsTask } from '@/tasks/minions/minigames/castleWarsActivity.js';
import { championsChallengeTask } from '@/tasks/minions/minigames/championsChallengeActivity.js';
import { chompHuntTask } from '@/tasks/minions/minigames/chompyHuntActivity.js';
import { fightCavesTask } from '@/tasks/minions/minigames/fightCavesActivity.js';
import { gauntletTask } from '@/tasks/minions/minigames/gauntletActivity.js';
import { gnomeResTask } from '@/tasks/minions/minigames/gnomeRestaurantActivity.js';
import { infernoTask } from '@/tasks/minions/minigames/infernoActivity.js';
import { lmsTask } from '@/tasks/minions/minigames/lmsActivity.js';
import { mageTrainingTask } from '@/tasks/minions/minigames/mageTrainingArenaActivity.js';
import { mahoganyHomesTask } from '@/tasks/minions/minigames/mahoganyHomesActivity.js';
import { nightmareTask } from '@/tasks/minions/minigames/nightmareActivity.js';
import { pestControlTask } from '@/tasks/minions/minigames/pestControlActivity.js';
import { plunderTask } from '@/tasks/minions/minigames/plunderActivity.js';
import { puroPuroTask } from '@/tasks/minions/minigames/puroPuroActivity.js';
import { raidsTask } from '@/tasks/minions/minigames/raidsActivity.js';
import { roguesDenTask } from '@/tasks/minions/minigames/roguesDenMazeActivity.js';
import { sepulchreTask } from '@/tasks/minions/minigames/sepulchreActivity.js';
import { shadesOfMortonTask } from '@/tasks/minions/minigames/shadesOfMortonActivity.js';
import { soulWarsTask } from '@/tasks/minions/minigames/soulWarsActivity.js';
import { togTask } from '@/tasks/minions/minigames/tearsOfGuthixActivity.js';
import { templeTrekkingTask } from '@/tasks/minions/minigames/templeTrekkingActivity.js';
import { temporossTask } from '@/tasks/minions/minigames/temporossActivity.js';
import { titheFarmTask } from '@/tasks/minions/minigames/titheFarmActivity.js';
import { toaTask } from '@/tasks/minions/minigames/toaActivity.js';
import { tobTask } from '@/tasks/minions/minigames/tobActivity.js';
import { trawlerTask } from '@/tasks/minions/minigames/trawlerActivity.js';
import { brewingTask } from '@/tasks/minions/minigames/troubleBrewingActivity.js';
import { animatedArmorTask } from '@/tasks/minions/minigames/warriorsGuild/animatedArmourActivity.js';
import { cyclopsTask } from '@/tasks/minions/minigames/warriorsGuild/cyclopsActivity.js';
import { wintertodtTask } from '@/tasks/minions/minigames/wintertodtActivity.js';
import { zalcanoTask } from '@/tasks/minions/minigames/zalcanoActivity.js';
import { miningTask } from '@/tasks/minions/miningActivity.js';
import { monsterTask } from '@/tasks/minions/monsterActivity.js';
import { motherlodeMiningTask } from '@/tasks/minions/motherlodeMineActivity.js';
import { myNotesTask } from '@/tasks/minions/myNotesActivity.js';
import { nexTask } from '@/tasks/minions/nexActivity.js';
import ouraniaAltarTask from '@/tasks/minions/ouraniaAltarActivity.js';
import { buryingTask } from '@/tasks/minions/PrayerActivity/buryingActivity.js';
import { offeringTask } from '@/tasks/minions/PrayerActivity/offeringActivity.js';
import { scatteringTask } from '@/tasks/minions/PrayerActivity/scatteringActivity.js';
import { pickpocketTask } from '@/tasks/minions/pickpocketActivity.js';
import { questingTask } from '@/tasks/minions/questingActivity.js';
import { runecraftTask } from '@/tasks/minions/runecraftActivity.js';
import { sawmillTask } from '@/tasks/minions/sawmillActivity.js';
import { shootingStarTask } from '@/tasks/minions/shootingStarsActivity.js';
import { smeltingTask } from '@/tasks/minions/smeltingActivity.js';
import { smithingTask } from '@/tasks/minions/smithingActivity.js';
import { specificQuestTask } from '@/tasks/minions/specificQuestActivity.js';
import { strongholdTask } from '@/tasks/minions/strongholdOfSecurityActivity.js';
import { tiaraRunecraftTask } from '@/tasks/minions/tiaraRunecraftActivity.js';
import { tokkulShopTask } from '@/tasks/minions/tokkulShopActivity.js';
import { vmTask } from '@/tasks/minions/volcanicMineActivity.js';
import { wealthChargeTask } from '@/tasks/minions/wealthChargingActivity.js';
import { woodcuttingTask } from '@/tasks/minions/woodcuttingActivity.js';
import { giantsFoundryTask } from './../tasks/minions/minigames/giantsFoundryActivity.js';
import { guardiansOfTheRiftTask } from './../tasks/minions/minigames/guardiansOfTheRiftActivity.js';
import { nightmareZoneTask } from './../tasks/minions/minigames/nightmareZoneActivity.js';
import { underwaterAgilityThievingTask } from './../tasks/minions/underwaterActivity.js';

export const allTasks: MinionTask[] = [
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
	scatteringTask,
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
	ouraniaAltarTask,
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
	motherlodeMiningTask,
	runecraftTask,
	sawmillTask,
	woodcuttingTask,
	wealthChargeTask,
	tokkulShopTask,
	smeltingTask,
	nexTask,
	pickpocketTask,
	questingTask,
	monsterTask,
	vmTask,
	templeTrekkingTask,
	mageTrainingTask,
	sepulchreTask,
	titheFarmTask,
	temporossTask,
	smithingTask,
	shootingStarTask,
	giantsFoundryTask,
	guardiansOfTheRiftTask,
	butlerTask,
	tiaraRunecraftTask,
	nightmareZoneTask,
	shadesOfMortonTask,
	cutLeapingFishTask,
	toaTask,
	underwaterAgilityThievingTask,
	strongholdTask,
	combatRingTask,
	specificQuestTask,
	camdozaalMiningTask,
	camdozaalSmithingTask,
	camdozaalFishingTask,
	myNotesTask,
	colosseumTask,
	CreateForestersRationsTask,
	buyTask
];

type MinionTaskRunOptions = {
	user: MUser;
	handleTripFinish: typeof handleTripFinish;
};

type IMinionTask =
	| {
			type: activity_type_enum;
			run: (data: any) => Promise<void>;
	  }
	| {
			type: activity_type_enum;
			isNew: true;
			run: (data: any, options: MinionTaskRunOptions) => Promise<void>;
	  };
declare global {
	export type MinionTask = IMinionTask;
}

const ignored: activity_type_enum[] = [
	activity_type_enum.BirthdayEvent,
	activity_type_enum.BlastFurnace,
	activity_type_enum.Easter,
	activity_type_enum.HalloweenEvent,
	activity_type_enum.Revenants,
	activity_type_enum.KourendFavour
];
for (const a of Object.values(activity_type_enum)) {
	if (ignored.includes(a)) {
		continue;
	}
	const t = allTasks.find(i => i.type === a);
	if (!t) {
		throw new Error(`Missing ${a} task`);
	}
}
