import { formatDuration } from '@oldschoolgg/toolkit/datetime';

import { ClueTiers } from '@/lib/clues/clueTiers';
import killableMonsters from '@/lib/minions/data/killableMonsters';
import Agility from '@/lib/skilling/skills/agility';
import Cooking from '@/lib/skilling/skills/cooking/cooking';
import Crafting from '@/lib/skilling/skills/crafting';
import Firemaking from '@/lib/skilling/skills/firemaking';
import { Fishing } from '@/lib/skilling/skills/fishing/fishing';
import Mining from '@/lib/skilling/skills/mining';
import Woodcutting from '@/lib/skilling/skills/woodcutting/woodcutting';
import type {
    ActivityTaskData,
    ActivityTaskOptionsWithQuantity,
    AgilityActivityTaskOptions,
    ClueActivityTaskOptions,
    ColoTaskOptions,
    CookingActivityTaskOptions,
    CraftingActivityTaskOptions,
    FiremakingActivityTaskOptions,
    FishingActivityTaskOptions,
    FletchingActivityTaskOptions,
    GroupMonsterActivityTaskOptions,
    InfernoOptions,
    MinigameActivityTaskOptionsWithNoChanges,
    MiningActivityTaskOptions,
    MonsterActivityTaskOptions,
    NightmareActivityTaskOptions,
    TheatreOfBloodTaskOptions,
    TOAOptions,
    WoodcuttingActivityTaskOptions
} from '@/lib/types/minions.js';

export function minionStatusRaw(task: ActivityTaskData): string {
	const duration = task.finishDate - Date.now();
	const d = formatDuration(duration);

	switch (task.type) {
		case 'MonsterKilling': {
			const data = task as MonsterActivityTaskOptions;
			const mon = killableMonsters.find(i => i.id === data.mi);
			return `Killed ${data.q}x ${mon?.name} in ${d}`;
		}
		case 'GroupMonsterKilling': {
			const data = task as GroupMonsterActivityTaskOptions;
			const mon = killableMonsters.find(i => i.id === data.mi);
			return `Killed ${data.q}x ${mon?.name} with ${data.users.length} users in ${d}`;
		}
		case 'ClueCompletion': {
			const data = task as ClueActivityTaskOptions;
			const tier = ClueTiers.find(i => i.id === data.ci);
			return `Completed ${data.q}x ${tier?.name} clues in ${d}`;
		}
		case 'Agility': {
			const data = task as AgilityActivityTaskOptions;
			const course = Agility.Courses.find(i => i.id === data.courseID);
			return `Ran ${data.quantity}x ${course?.name} laps in ${d}`;
		}
		case 'Crafting': {
			const data = task as CraftingActivityTaskOptions;
			const item = Crafting.Craftables.find(i => i.id === data.craftableID);
			return `Crafted ${data.quantity}x ${item?.name} in ${d}`;
		}
		case 'Fishing': {
			const data = task as FishingActivityTaskOptions;
			const fish = Fishing.Fishes.find(i => i.id === data.fishID);
			return `Fished ${data.quantity}x ${fish?.name} in ${d}`;
		}
		case 'Mining': {
			const data = task as MiningActivityTaskOptions;
			const ore = Mining.Ores.find(i => i.id === data.oreID);
			return `Mined ${ore?.name} for ${d}`;
		}
		case 'Cooking': {
			const data = task as CookingActivityTaskOptions;
			const food = Cooking.Cookables.find(i => i.id === data.cookableID);
			return `Cooked ${data.quantity}x ${food?.name} in ${d}`;
		}
		case 'Woodcutting': {
			const data = task as WoodcuttingActivityTaskOptions;
			const log = Woodcutting.Logs.find(i => i.id === data.logID);
			return `Chopped ${log?.name} for ${d}`;
		}
		case 'Fletching': {
			const data = task as FletchingActivityTaskOptions;
			return `Fletched ${data.quantity}x ${data.fletchableName} in ${d}`;
		}
		case 'Firemaking': {
			const data = task as FiremakingActivityTaskOptions;
			const logs = Firemaking.Burnables.find(i => i.inputLogs === data.burnableID);
			return `Burned ${data.quantity}x ${logs?.name} in ${d}`;
		}
		case 'Nightmare': {
			const data = task as NightmareActivityTaskOptions;
			return `Killed Nightmare ${data.method === 'solo' ? 'solo' : 'in a team'} in ${d}`;
		}
		case 'Tempoross':
			return `Fought Tempoross in ${d}`;
		case 'Wintertodt': {
			const data = task as ActivityTaskOptionsWithQuantity;
			return `Fought Wintertodt ${data.quantity}x in ${d}`;
		}
		case 'BarbarianAssault': {
			const data = task as MinigameActivityTaskOptionsWithNoChanges;
			return `Did ${data.quantity} waves of Barbarian Assault in ${d}`;
		}
		case 'Inferno': {
			const data = task as InfernoOptions;
			const duration = data.finishDate - data.duration + data.fakeDuration - Date.now();
			return `Attempted Inferno in ${formatDuration(duration)}`;
		}
		case 'TheatreOfBlood': {
			const data = task as TheatreOfBloodTaskOptions;
			const duration = data.finishDate - data.duration + data.fakeDuration - Date.now();
			return `Attempted Theatre of Blood in ${formatDuration(duration)}`;
		}
		case 'TombsOfAmascut': {
			const data = task as TOAOptions;
			const duration = data.finishDate - data.duration + data.fakeDuration - Date.now();
			return `Attempted Tombs of Amascut in ${formatDuration(duration)}`;
		}
		case 'Colosseum': {
			const data = task as ColoTaskOptions;
			const duration = data.finishDate - data.duration + data.fakeDuration - Date.now();
			return `Attempted Colosseum in ${formatDuration(duration)}`;
		}
		default:
			return `Doing ${task.type} for ${d}`;
	}
}
