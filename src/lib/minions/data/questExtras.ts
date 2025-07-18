import { EQuest } from 'oldschooljs';

export interface Quest {
	id: number;
	name?: string;
	qp?: number;
	kudos?: number;
	qpReq?: number;
	kudosReq?: number;
	prerequisiteQuests?: string[];
	skillReqs?: Record<string, number>;
	itemsRequired?: Record<string, number>;
	itemRewards?: Record<string, number>;
	skillsRewards?: Record<string, number>;
	details?: {
		difficulty?: string;
		length?: string;
	};
}

export const questExtras: Quest[] = [
	{
		id: EQuest.CLIENT_OF_KOUREND,
		itemRewards: {
			'Antique lamp (client of kourend)': 2
		}
	},
	{
		id: EQuest.ONE_SMALL_FAVOUR,
		itemRewards: {
			'Antique lamp (one small favour)': 2
		}
	},
	{
		id: EQuest.A_TAIL_OF_TWO_CATS,
		itemRewards: {
			'Antique lamp (a tail of two cats)': 2
		}
	},
	{
		id: EQuest.FAIRYTALE_II__CURE_A_QUEEN,
		itemRewards: {
			'Antique lamp (a tail of two cats)': 1
		}
	},
	{
		id: EQuest.RECIPE_FOR_DISASTER,
		itemRewards: {
			'Antique lamp (recipe for disaster)': 1
		}
	},
	{
		id: EQuest.MERLINS_CRYSTAL,
		itemRewards: {
			"Antique lamp (merlin's crystal)": 1
		}
	},
	{
		id: EQuest.SHIELD_OF_ARRAV,
		itemRewards: {
			'Antique lamp (shield of arrav)': 1
		}
	},
	{
		id: EQuest.MAKING_HISTORY,
		itemRewards: {
			'Antique lamp (making history)': 1
		}
	},
	{
		id: EQuest.KINGS_RANSOM,
		itemRewards: {
			"Antique lamp (king's ransom)": 1
		}
	},
	{
		id: EQuest.X_MARKS_THE_SPOT,
		itemRewards: {
			'Antique lamp (x marks the spot)': 1
		}
	},
	{
		id: EQuest.A_NIGHT_AT_THE_THEATRE,
		itemRewards: {
			'Antique lamp (a night at the theatre)': 4
		}
	},
	{
		id: EQuest.A_KINGDOM_DIVIDED,
		itemRewards: {
			'Antique lamp (a kingdom divided)': 2
		}
	},
	{
		id: EQuest.LEGENDS_QUEST,
		itemRewards: {
			"Antique lamp (legends' quest)": 4
		}
	},
	{
		id: EQuest.DEFENDER_OF_VARROCK,
		itemRewards: {
			'Antique lamp (defender of varrock)': 1
		}
	},
	{
		id: EQuest.DARKNESS_OF_HALLOWVALE,
		itemRewards: {
			'Tome of experience (darkness of hallowvale) (3)': 1,
			'Tome of experience (darkness of hallowvale) (2)': 1,
			'Tome of experience (darkness of hallowvale) (1)': 1
		}
	},
	{
		id: EQuest.DESERT_TREASURE_II__THE_FALLEN_EMPIRE,
		itemRewards: {
			'Ancient lamp': 3
		}
	},
	{
		id: EQuest.DREAM_MENTOR,
		itemRewards: {
			'Dreamy lamp': 1
		}
	},
	{
		id: EQuest.THE_GREAT_BRAIN_ROBBERY,
		itemRewards: {
			'Blessed lamp': 1
		}
	},
	{
		id: EQuest.THE_PATH_OF_GLOUPHRIE,
		itemRewards: {
			'Magic lamp (strength)': 1,
			'Magic lamp (slayer)': 1,
			'Magic lamp (thieving)': 1,
			'Magic lamp (magic)': 1
		}
	},
	{
		id: EQuest.THE_DIG_SITE,
		kudos: 50
	},
	{
		id: EQuest.MONKEY_MADNESS_I,
		skillsRewards: {
			attack: 35000,
			defence: 35000,
			strength: 20000,
			hitpoints: 20000
		}
	},
	{
		id: EQuest.A_TASTE_OF_HOPE,
		itemRewards: {
			'Tome of experience (A Taste of Hope)': 3
		}
	},
	{
		id: EQuest.SINS_OF_THE_FATHER,
		itemRewards: {
			'Tome of experience (sins of the father)': 6
		}
	},
	{
		id: EQuest.WHILE_GUTHIX_SLEEPS,
		itemRewards: {
			"Duradel's notes": 1
		}
	},
	{
		id: EQuest.DESERT_TREASURE_I,
		kudos: 10
	},
	{
		id: EQuest.DRAGON_SLAYER_I,
		itemRewards: {
			'Anti-dragon shield': 1
		}
	}
];
