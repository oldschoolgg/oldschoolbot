import { Minigame } from '@prisma/client';

import { prisma } from './prisma';

export type MinigameName = keyof Omit<Minigame, 'id' | 'user_id'>;

export interface BotMinigame {
	name: string;
	aliases: string[];
	column: MinigameName;
}

export interface MinigameScore {
	minigame: BotMinigame;
	score: number;
}

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
		name: "Chamber's of Xeric",
		aliases: ['cox', 'raid1', 'raids1', 'chambers', 'xeric'],
		column: 'raids'
	},
	{
		name: "Chamber's of Xeric - Challenge Mode",
		aliases: ['coxcm', 'raid1cm', 'raids1cm', 'chamberscm', 'xericcm'],
		column: 'raids_challenge_mode'
	},
	{
		name: 'Magic Training Arena',
		aliases: ['mta'],
		column: 'magic_training_arena'
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
		name: 'Inferno',
		aliases: ['inferno', 'zuk'],
		column: 'inferno'
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
		name: 'Last Man Standing',
		aliases: ['last man standing', 'lms'],
		column: 'lms'
	}
];

export async function getMinigameScore(userID: string, minigame: MinigameName) {
	const MinigameEntity = await getMinigameEntity(userID);
	return MinigameEntity[minigame];
}

export async function getMinigameEntity(userID: string): Promise<Minigame> {
	const value = await prisma.minigame.findUnique({ where: { user_id: userID } });
	if (!value) {
		return prisma.minigame.create({
			data: {
				user_id: userID
			}
		});
	}
	return value;
}

export async function incrementMinigameScore(userID: string, minigame: MinigameName, amountToAdd = 1) {
	const result = await prisma.minigame.update({
		where: { user_id: userID },
		data: { [minigame]: { increment: amountToAdd } }
	});

	return {
		newScore: result[minigame],
		entity: result
	};
}

export async function getAllMinigameScores(userID: string): Promise<MinigameScore[]> {
	const UserMinigames = await getMinigameEntity(userID);
	const scores: MinigameScore[] = [];
	for (const minigame of Minigames) {
		const score = UserMinigames[minigame.column];
		scores.push({ minigame, score });
	}
	return scores;
}
