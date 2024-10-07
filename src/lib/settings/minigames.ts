import type { Minigame } from '@prisma/client';

export type MinigameName = keyof Omit<Minigame, 'id' | 'user_id'>;

interface BotMinigame {
	name: string;
	aliases: string[];
	column: MinigameName;
}

export interface MinigameScore {
	minigame: BotMinigame;
	score: number;
}

export const minigameColumnToNameMap = new Map<string, string>();
export const Minigames: readonly BotMinigame[] = [
	{
		name: 'Tithe farm',
		aliases: ['tf', 'tithe'],
		column: 'tithe_farm'
	},
	{
		name: 'Wintertodt',
		aliases: ['wt'],
		column: 'wintertodt'
	},
	{
		name: 'Tempoross',
		aliases: ['temp', 'ross', 'tempo', 'watertodt'],
		column: 'tempoross'
	},
	{
		name: 'Hallowed Sepulchre',
		aliases: ['hs', 'sepulchre'],
		column: 'sepulchre'
	},
	{
		name: 'Fishing Trawler',
		aliases: ['trawler', 'ft'],
		column: 'fishing_trawler'
	},
	{
		name: 'Barbarian Assault',
		aliases: ['ba', 'barb'],
		column: 'barb_assault'
	},
	{
		name: 'Pyramid Plunder',
		aliases: ['pp', 'pyramid', 'plunder'],
		column: 'pyramid_plunder'
	},
	{
		name: 'Brimhaven Agility Arena',
		aliases: ['baa', 'aa', 'agilarena'],
		column: 'agility_arena'
	},
	{
		name: "Champions' Challenge",
		aliases: ['champion', 'scrolls'],
		column: 'champions_challenge'
	},
	{
		name: 'Mahogany Homes',
		aliases: ['mh', 'mahogany', 'homes'],
		column: 'mahogany_homes'
	},
	{
		name: 'Gnome Restaurant',
		aliases: ['gh', 'gnome', 'restaurant'],
		column: 'gnome_restaurant'
	},
	{
		name: 'Soul Wars',
		aliases: ['sw', 'soul'],
		column: 'soul_wars'
	},
	{
		name: "Rogues' Den",
		aliases: ['rd', 'rogues', 'den'],
		column: 'rogues_den'
	},
	{
		name: 'Gauntlet',
		aliases: ['gauntlet', 'gaunt', 'ng'],
		column: 'gauntlet'
	},
	{
		name: 'Corrupted Gauntlet',
		aliases: ['cgauntlet', 'corruptedg', 'corruptg', 'cg'],
		column: 'corrupted_gauntlet'
	},
	{
		name: 'Castle Wars',
		aliases: ['cw', 'cwars'],
		column: 'castle_wars'
	},
	{
		name: 'Chambers of Xeric',
		aliases: ['cox', 'raid1', 'raids1', 'chambers', 'xeric'],
		column: 'raids'
	},
	{
		name: 'Chambers of Xeric - Challenge Mode',
		aliases: ['coxcm', 'raid1cm', 'raids1cm', 'chamberscm', 'xericcm'],
		column: 'raids_challenge_mode'
	},
	{
		name: 'Magic Training Arena',
		aliases: ['mta'],
		column: 'magic_training_arena'
	},
	{
		name: 'Ourania Delivery Service',
		aliases: ['ods'],
		column: 'ourania_delivery_service'
	},
	{
		name: 'Puro Puro',
		aliases: ['puro', 'puro puro'],
		column: 'puro_puro'
	},
	{
		name: 'Big Chompy Bird Hunting',
		aliases: ['chimpy', 'bcbh'],
		column: 'big_chompy_bird_hunting'
	},
	{
		name: 'Temple Trekking',
		aliases: ['tt', 'trek'],
		column: 'temple_trekking'
	},
	{
		name: 'Pest Control',
		aliases: ['pest', 'pc'],
		column: 'pest_control'
	},
	{
		name: 'Volcanic Mine',
		aliases: ['vm'],
		column: 'volcanic_mine'
	},
	{
		name: "Mad Marimbo's Monkey Rumble",
		column: 'monkey_rumble',
		aliases: ['mmmr', 'mr', 'mmr']
	},
	{
		name: 'Inferno',
		aliases: ['inferno', 'zuk'],
		column: 'inferno'
	},
	{
		name: 'Emerged Zuk Inferno',
		aliases: ['ei', 'emerged inferno'],
		column: 'emerged_inferno'
	},
	{
		name: 'Tears Of Guthix',
		aliases: ['tog'],
		column: 'tears_of_guthix'
	},
	{
		name: 'Theatre of Blood',
		aliases: ['tob', 'theatre of blood'],
		column: 'tob'
	},
	{
		name: 'Theatre of Blood - Hard Mode',
		aliases: ['tob hard', 'tob hard mode'],
		column: 'tob_hard'
	},
	{
		name: 'Fishing Contest',
		aliases: ['fishing contest', 'fc'],
		column: 'fishing_contest'
	},
	{
		name: 'Last Man Standing',
		aliases: ['last man standing', 'lms'],
		column: 'lms'
	},
	{
		name: 'Baxtorian Bathhouses',
		aliases: ['bb', 'bbh', 'baxtorian bathhouses', 'baxtorian bathhouse'],
		column: 'bax_baths'
	},
	{
		name: 'Trouble Brewing',
		aliases: ['trouble brewing', 'tb'],
		column: 'trouble_brewing'
	},
	{
		name: "Giants' Foundry",
		aliases: ['giants', 'foundry', 'giants foundry', "giants' foundry"],
		column: 'giants_foundry'
	},
	{
		name: 'Guardians Of The Rift',
		aliases: ['guardians of the rift', 'gotr', 'guardian of the rift'],
		column: 'guardians_of_the_rift'
	},
	{
		name: 'Fist of Guthix',
		aliases: ['fist of guthix', 'fog'],
		column: 'fist_of_guthix'
	},
	{
		name: 'Stealing Creation',
		aliases: ['stealing creation', 'sc'],
		column: 'stealing_creation'
	},
	{
		name: 'Nightmare Zone',
		aliases: ['nightmare zone', 'nmz'],
		column: 'nmz'
	},
	{
		name: "Shades of Mort'ton",
		aliases: ['som', "shades of mort'ton"],
		column: 'shades_of_morton'
	},
	{
		name: 'Tinkering Workshop',
		aliases: ['tinkering workshop', 'tw'],
		column: 'tinkering_workshop'
	},
	{
		name: 'Tombs of Amascut',
		aliases: ['toa', 'tombs of amascut'],
		column: 'tombs_of_amascut'
	},
	{
		name: 'Balthazars Big Bonanza',
		aliases: ['bbb', 'balthazars big bonanza', 'circus'],
		column: 'balthazars_big_bonanza'
	},
	{
		name: 'Depths of Atlantis',
		aliases: ['doa'],
		column: 'depths_of_atlantis'
	},
	{
		name: 'Depths of Atlantis - Challenge Mode',
		aliases: ['doa cm'],
		column: 'depths_of_atlantis_cm'
	},
	{
		name: 'Guthixian Caches',
		aliases: ['guthixian caches', 'cache'],
		column: 'guthixian_cache'
	},
	{
		name: 'Turaels Trials',
		aliases: ['turaels trials', 'trials'],
		column: 'turaels_trials'
	},
	{
		name: 'Fortis Colosseum',
		aliases: ['colo'],
		column: 'colosseum'
	}
];

for (const minigame of Minigames) {
	minigameColumnToNameMap.set(minigame.column, minigame.name);
}

export async function getMinigameScore(userID: string, minigame: MinigameName) {
	const MinigameEntity = await getMinigameEntity(userID);
	return MinigameEntity[minigame];
}

export async function getMinigameEntity(userID: string): Promise<Minigame> {
	const value = await prisma.minigame.upsert({ where: { user_id: userID }, create: { user_id: userID }, update: {} });
	return value;
}

export async function incrementMinigameScore(userID: string, minigame: MinigameName, amountToAdd = 1) {
	const result = await prisma.minigame.upsert({
		where: { user_id: userID },
		update: { [minigame]: { increment: amountToAdd } },
		create: { user_id: userID, [minigame]: amountToAdd }
	});

	return {
		newScore: result[minigame],
		entity: result
	};
}
