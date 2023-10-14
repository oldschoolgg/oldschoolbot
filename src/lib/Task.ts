import { Activity, activity_type_enum } from '@prisma/client';

import { agilityTask } from '../tasks/minions/agilityActivity';
import { alchingTask } from '../tasks/minions/alchingActivity';
import { butlerTask } from '../tasks/minions/butlerActivity';
import { castingTask } from '../tasks/minions/castingActivity';
import { clueTask } from '../tasks/minions/clueActivity';
import { collectingTask } from '../tasks/minions/collectingActivity';
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
import { gloryChargingTask } from '../tasks/minions/gloryChargingActivity';
import { groupoMonsterTask } from '../tasks/minions/groupMonsterActivity';
import { halloweenTask } from '../tasks/minions/halloweenActivity';
import { herbloreTask } from '../tasks/minions/herbloreActivity';
import { aerialFishingTask } from '../tasks/minions/HunterActivity/aerialFishingActivity';
import { birdHouseTask } from '../tasks/minions/HunterActivity/birdhouseActivity';
import { driftNetTask } from '../tasks/minions/HunterActivity/driftNetActivity';
import { hunterTask } from '../tasks/minions/HunterActivity/hunterActivity';
import { kourendTask } from '../tasks/minions/kourendFavourActivity';
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
import { nexTask } from '../tasks/minions/nexActivity';
import { pickpocketTask } from '../tasks/minions/pickpocketActivity';
import { buryingTask } from '../tasks/minions/PrayerActivity/buryingActivity';
import { offeringTask } from '../tasks/minions/PrayerActivity/offeringActivity';
import { scatteringTask } from '../tasks/minions/PrayerActivity/scatteringActivity';
import { questingTask } from '../tasks/minions/questingActivity';
import { revenantsTask } from '../tasks/minions/revenantsActivity';
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
import { modifyBusyCounter } from './busyCounterCache';
import { minionActivityCache } from './constants';
import { convertStoredActivityToFlatActivity, prisma } from './settings/prisma';
import { activitySync, minionActivityCacheDelete } from './settings/settings';
import { logError } from './util/logError';

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
	revenantsTask,
	woodcuttingTask,
	wealthChargeTask,
	tokkulShopTask,
	smeltingTask,
	nexTask,
	pickpocketTask,
	questingTask,
	monsterTask,
	kourendTask,
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
	specificQuestTask,
	halloweenTask
];

export async function syncActivityCache() {
	const tasks = await prisma.activity.findMany({ where: { completed: false } });

	minionActivityCache.clear();
	for (const task of tasks) {
		activitySync(task);
	}
}

export async function completeActivity(_activity: Activity) {
	const activity = convertStoredActivityToFlatActivity(_activity);
	debugLog(`Attemping to complete activity ID[${activity.id}] TYPE[${activity.type}] USER[${activity.userID}]`);

	if (_activity.completed) {
		throw new Error('Tried to complete an already completed task.');
	}

	const task = tasks.find(i => i.type === activity.type)!;
	if (!task) {
		throw new Error('Missing task');
	}

	modifyBusyCounter(activity.userID, 1);
	try {
		await task.run(activity);
	} catch (err) {
		logError(err);
	} finally {
		modifyBusyCounter(activity.userID, -1);
		minionActivityCacheDelete(activity.userID);
		debugLog(`Finished completing activity ID[${activity.id}] TYPE[${activity.type}] USER[${activity.userID}]`);
	}
}

interface IMinionTask {
	type: activity_type_enum;
	run: Function;
}
declare global {
	export type MinionTask = IMinionTask;
}

const ignored: activity_type_enum[] = [
	activity_type_enum.BirthdayEvent,
	activity_type_enum.BlastFurnace,
	activity_type_enum.Easter,
	activity_type_enum.HalloweenEvent
];
for (const a of Object.values(activity_type_enum)) {
	if (ignored.includes(a)) {
		continue;
	}
	const t = tasks.find(i => i.type === a);
	if (!t) {
		throw new Error(`Missing ${a} task`);
	}
}
