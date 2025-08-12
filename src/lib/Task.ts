import { activity_type_enum } from '@prisma/client';

import { aerialFishingTask } from '../tasks/minions/HunterActivity/aerialFishingActivity';
import { birdHouseTask } from '../tasks/minions/HunterActivity/birdhouseActivity';
import { driftNetTask } from '../tasks/minions/HunterActivity/driftNetActivity';
import { hunterTask } from '../tasks/minions/HunterActivity/hunterActivity';
import { buryingTask } from '../tasks/minions/PrayerActivity/buryingActivity';
import { offeringTask } from '../tasks/minions/PrayerActivity/offeringActivity';
import { scatteringTask } from '../tasks/minions/PrayerActivity/scatteringActivity';
import { agilityTask } from '../tasks/minions/agilityActivity';
import { alchingTask } from '../tasks/minions/alchingActivity';
import { butlerTask } from '../tasks/minions/butlerActivity';
import { camdozaalFishingTask } from '../tasks/minions/camdozaalActivity/camdozaalFishingActivity';
import { camdozaalMiningTask } from '../tasks/minions/camdozaalActivity/camdozaalMiningActivity';
import { camdozaalSmithingTask } from '../tasks/minions/camdozaalActivity/camdozaalSmithingActivity';
import { castingTask } from '../tasks/minions/castingActivity';
import { clueTask } from '../tasks/minions/clueActivity';
import { collectingTask } from '../tasks/minions/collectingActivity';
import { colosseumTask } from '../tasks/minions/colosseumActivity';
import { combatRingTask } from '../tasks/minions/combatRingActivity';
import { constructionTask } from '../tasks/minions/constructionActivity';
import { cookingTask } from '../tasks/minions/cookingActivity';
import { craftingTask } from '../tasks/minions/craftingActivity';
import { cutLeapingFishTask } from '../tasks/minions/cutLeapingFishActivity';
import { darkAltarTask } from '../tasks/minions/darkAltarActivity';
import { enchantingTask } from '../tasks/minions/enchantingActivity';
import { farmingTask } from '../tasks/minions/farmingActivity';
import { firemakingTask } from '../tasks/minions/firemakingActivity';
import { fishingTask } from '../tasks/minions/fishingActivity';
import { fletchingTask } from '../tasks/minions/fletchingActivity';
import { CreateForestersRationsTask } from '../tasks/minions/forestersRationActivity';
import { gloryChargingTask } from '../tasks/minions/gloryChargingActivity';
import { groupoMonsterTask } from '../tasks/minions/groupMonsterActivity';
import { herbloreTask } from '../tasks/minions/herbloreActivity';
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
import { mageTrainingTask } from '../tasks/minions/minigames/mageTrainingArenaActivity';
import { mahoganyHomesTask } from '../tasks/minions/minigames/mahoganyHomesActivity';
import { nightmareTask } from '../tasks/minions/minigames/nightmareActivity';
import { pestControlTask } from '../tasks/minions/minigames/pestControlActivity';
import { plunderTask } from '../tasks/minions/minigames/plunderActivity';
import { puroPuroTask } from '../tasks/minions/minigames/puroPuroActivity';
import { raidsTask } from '../tasks/minions/minigames/raidsActivity';
import { roguesDenTask } from '../tasks/minions/minigames/roguesDenMazeActivity';
import { sepulchreTask } from '../tasks/minions/minigames/sepulchreActivity';
import { shadesOfMortonTask } from '../tasks/minions/minigames/shadesOfMortonActivity';
import { soulWarsTask } from '../tasks/minions/minigames/soulWarsActivity';
import { togTask } from '../tasks/minions/minigames/tearsOfGuthixActivity';
import { templeTrekkingTask } from '../tasks/minions/minigames/templeTrekkingActivity';
import { temporossTask } from '../tasks/minions/minigames/temporossActivity';
import { titheFarmTask } from '../tasks/minions/minigames/titheFarmActivity';
import { toaTask } from '../tasks/minions/minigames/toaActivity';
import { tobTask } from '../tasks/minions/minigames/tobActivity';
import { trawlerTask } from '../tasks/minions/minigames/trawlerActivity';
import { brewingTask } from '../tasks/minions/minigames/troubleBrewingActivity';
import { animatedArmorTask } from '../tasks/minions/minigames/warriorsGuild/animatedArmourActivity';
import { cyclopsTask } from '../tasks/minions/minigames/warriorsGuild/cyclopsActivity';
import { wintertodtTask } from '../tasks/minions/minigames/wintertodtActivity';
import { zalcanoTask } from '../tasks/minions/minigames/zalcanoActivity';
import { miningTask } from '../tasks/minions/miningActivity';
import { monsterTask } from '../tasks/minions/monsterActivity';
import { motherlodeMiningTask } from '../tasks/minions/motherlodeMineActivity';
import { myNotesTask } from '../tasks/minions/myNotesActivity';
import { nexTask } from '../tasks/minions/nexActivity';
import ouraniaAltarTask from '../tasks/minions/ouraniaAltarActivity';
import { pickpocketTask } from '../tasks/minions/pickpocketActivity';
import { questingTask } from '../tasks/minions/questingActivity';
import { runecraftTask } from '../tasks/minions/runecraftActivity';
import { sawmillTask } from '../tasks/minions/sawmillActivity';
import { shootingStarTask } from '../tasks/minions/shootingStarsActivity';
import { smeltingTask } from '../tasks/minions/smeltingActivity';
import { smithingTask } from '../tasks/minions/smithingActivity';
import { specificQuestTask } from '../tasks/minions/specificQuestActivity';
import { strongholdTask } from '../tasks/minions/strongholdOfSecurityActivity';
import { tiaraRunecraftTask } from '../tasks/minions/tiaraRunecraftActivity';
import { tokkulShopTask } from '../tasks/minions/tokkulShopActivity';
import { vmTask } from '../tasks/minions/volcanicMineActivity';
import { wealthChargeTask } from '../tasks/minions/wealthChargingActivity';
import { woodcuttingTask } from '../tasks/minions/woodcuttingActivity';
import { giantsFoundryTask } from './../tasks/minions/minigames/giantsFoundryActivity';
import { guardiansOfTheRiftTask } from './../tasks/minions/minigames/guardiansOfTheRiftActivity';
import { nightmareZoneTask } from './../tasks/minions/minigames/nightmareZoneActivity';
import { underwaterAgilityThievingTask } from './../tasks/minions/underwaterActivity';
import type { handleTripFinish } from './util/handleTripFinish';

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
	CreateForestersRationsTask
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
