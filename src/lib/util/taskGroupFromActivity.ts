import { Activity, ActivityGroup } from '../constants';

export function taskGroupFromActivity(type: Activity): ActivityGroup {
	switch (type) {
		case Activity.ClueCompletion:
			return ActivityGroup.Clue;
		case Activity.GroupMonsterKilling:
		case Activity.MonsterKilling:
			return ActivityGroup.Monster;
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
		case Activity.Sawmill:
		case Activity.Pickpocket:
		case Activity.Farming:
		case Activity.Herblore:
		case Activity.Hunter:
		case Activity.Birdhouse:
		case Activity.Construction:
			return ActivityGroup.Skilling;
		case Activity.FightCaves:
		case Activity.Wintertodt:
		case Activity.Nightmare:
		case Activity.AnimatedArmour:
		case Activity.Cyclops:
		case Activity.Sepulchre:
		case Activity.Plunder:
		case Activity.Zalcano:
		case Activity.FishingTrawler:
		case Activity.TitheFarm:
		case Activity.BarbarianAssault:
		case Activity.AgilityArena:
		case Activity.ChampionsChallenge:
		case Activity.Raids:
		case Activity.MahoganyHomes:
			return ActivityGroup.Minigame;
		default: {
			throw new Error(`Unrecognized activity: ${type}`);
		}
	}
}
