import { minigames } from '@prisma/client';
import { User } from 'discord.js';
import { Extendable, ExtendableStore, KlasaUser } from 'klasa';

import { getMinigameEntity, incrementMinigameScore } from '../../lib/settings/settings';

export interface MinigameScore {
	minigame: Minigame;
	score: number;
}

export type Minigame = typeof Minigames[number];

export const Minigames: Minigame[] = [
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
		key: 'Tempoross',
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
		key: 'FishingTrawler',
		column: 'fishing_trawler'
	},
	{
		name: 'Barbarian Assault',
		aliases: ['ba', 'barb'],
		key: 'BarbarianAssault',
		column: 'barb_assault'
	},
	{
		name: 'Pyramid Plunder',
		aliases: ['pp', 'pyramid', 'plunder'],
		key: 'PyramidPlunder',
		column: 'pyramid_plunder'
	},
	{
		name: 'Brimhaven Agility Arena',
		aliases: ['baa', 'aa', 'agilarena'],
		key: 'AgilityArena',
		column: 'agility_arena'
	},
	{
		name: "Champions' Challenge",
		aliases: ['champion', 'scrolls'],
		key: 'ChampionsChallenge',
		column: 'champions_challenge'
	},
	{
		name: 'Mahogany Homes',
		aliases: ['mh', 'mahogany', 'homes'],
		key: 'MahoganyHomes',
		column: 'mahogany_homes'
	},
	{
		name: 'Gnome Restaurant',
		aliases: ['gh', 'gnome', 'restaurant'],
		key: 'GnomeRestaurant',
		column: 'gnome_restaurant'
	},
	{
		name: 'Soul Wars',
		aliases: ['sw', 'soul'],
		key: 'SoulWars',
		column: 'soul_wars'
	},
	{
		name: "Rogues' Den",
		aliases: ['rd', 'rogues', 'den'],
		key: 'RoguesDenMaze',
		column: 'rogues_den'
	},
	{
		name: 'Gauntlet',
		aliases: ['gauntlet', 'gaunt', 'ng'],
		key: 'Gauntlet',
		column: 'gauntlet'
	},
	{
		name: 'Corrupted Gauntlet',
		aliases: ['cgauntlet', 'corruptedg', 'corruptg', 'cg'],
		key: 'CorruptedGauntlet',
		column: 'corrupted_gauntlet'
	},
	{
		name: 'Castle Wars',
		aliases: ['cw', 'cwars'],
		key: 'CastleWars',
		column: 'castle_wars'
	},
	{
		name: "Chamber's of Xeric",
		aliases: ['cox', 'raid1', 'raids1', 'chambers', 'xeric'],
		key: 'Raids',
		column: 'raids'
	},
	{
		name: "Chamber's of Xeric - Challenge Mode",
		aliases: ['coxcm', 'raid1cm', 'raids1cm', 'chamberscm', 'xericcm'],
		key: 'RaidsChallengeMode',
		column: 'raids_challenge_mode'
	},
	{
		name: 'Magic Training Arena',
		aliases: ['mta'],
		key: 'MagicTrainingArena',
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
	}
] as const;

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	async getMinigameScore(this: KlasaUser, minigame: Minigame['column']) {
		const MinigameEntity = await this.getMinigameEntity();
		return MinigameEntity[minigame];
	}

	async getMinigameEntity(this: KlasaUser): Promise<minigames> {
		return getMinigameEntity(this.id);
	}

	public async incrementMinigameScore(this: User, minigame: Minigame['column'], amountToAdd = 1) {
		return incrementMinigameScore(this.id, minigame, amountToAdd);
	}

	async getAllMinigameScores(this: User): Promise<MinigameScore[]> {
		const UserMinigames = await this.getMinigameEntity();
		const scores: MinigameScore[] = [];
		for (const minigame of Minigames) {
			const score = UserMinigames[minigame.column];
			scores.push({ minigame, score });
		}
		return scores;
	}
}
