import type { Activity } from '@prisma/client';
import { activity_type_enum } from '@prisma/client';
import type { ZodSchema } from 'zod';
import { z } from 'zod';

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
import { modifyBusyCounter } from './busyCounterCache';
import { globalConfig, minionActivityCache } from './constants';
import { sql } from './postgres';
import { convertStoredActivityToFlatActivity } from './settings/prisma';
import { activitySync, minionActivityCacheDelete } from './settings/settings';
import { logError } from './util/logError';

const tasks: MinionTask[] = [
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

export async function processPendingActivities() {
	const activities: Activity[] = globalConfig.isProduction
		? await sql`SELECT * FROM activity WHERE completed = false AND finish_date < NOW() LIMIT 5;`
		: await sql`SELECT * FROM activity WHERE completed = false;`;

	if (activities.length > 0) {
		await prisma.activity.updateMany({
			where: {
				id: {
					in: activities.map(i => i.id)
				}
			},
			data: {
				completed: true
			}
		});
		await Promise.all(activities.map(completeActivity));
	}
}

export const syncActivityCache = async () => {
	const tasks = await prisma.activity.findMany({ where: { completed: false } });
	minionActivityCache.clear();
	for (const task of tasks) {
		activitySync(task);
	}
};

const ActivityTaskOptionsSchema = z.object({
	userID: z.string(),
	duration: z.number(),
	id: z.number(),
	finishDate: z.number(),
	channelID: z.string()
});

export async function completeActivity(_activity: Activity) {
	const activity = convertStoredActivityToFlatActivity(_activity);

	if (_activity.completed) {
		logError(new Error('Tried to complete an already completed task.'));
		return;
	}

	const task = tasks.find(i => i.type === activity.type)!;
	if (!task) {
		logError(new Error('Missing task'));
		return;
	}

	modifyBusyCounter(activity.userID, 1);
	try {
		if ('dataSchema' in task && task.dataSchema) {
			const schema = ActivityTaskOptionsSchema.and(task.dataSchema);
			const { success } = schema.safeParse(activity);
			if (!success) {
				logError(new Error(`Invalid activity data for ${activity.type} task: ${JSON.stringify(activity)}`));
			}
		}
		await task.run(activity);
	} catch (err) {
		logError(err);
	} finally {
		modifyBusyCounter(activity.userID, -1);
		minionActivityCacheDelete(activity.userID);
	}
}

interface IMinionTask {
	type: activity_type_enum;
	dataSchema?: ZodSchema;
	run: Function;
}
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
	const t = tasks.find(i => i.type === a);
	if (!t) {
		throw new Error(`Missing ${a} task`);
	}
}
