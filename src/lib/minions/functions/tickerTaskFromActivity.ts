import { Activity, Tasks } from '../../constants';

/**
 * Returns what ticker task an activity uses.
 * @param type The activity.
 */
export function tickerTaskFromActivity(type: Activity): Tasks {
	switch (type) {
		case Activity.ClueCompletion:
			return Tasks.ClueTicker;
		case Activity.GroupMonsterKilling:
		case Activity.MonsterKilling:
			return Tasks.MonsterKillingTicker;
		case Activity.Fishing:
		case Activity.Agility:
		case Activity.Burying:
		case Activity.Offering:
		case Activity.Cooking:
		case Activity.Firemaking:
		case Activity.Mining:
		case Activity.Questing:
		case Activity.Runecraft:
		case Activity.Smelting:
		case Activity.Smithing:
		case Activity.Woodcutting:
		case Activity.Fletching:
		case Activity.Crafting:
		case Activity.Alching:
			return Tasks.SkillingTicker;
		case Activity.FightCaves:
		case Activity.Wintertodt:
			return Tasks.MinigameTicker;
		default: {
			throw new Error(`Unrecognized activity`);
		}
	}
}
