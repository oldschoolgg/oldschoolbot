import { minigames } from '@prisma/client';
import { User } from 'discord.js';
import { Extendable, ExtendableStore, KlasaUser } from 'klasa';

import { getMinigameEntity, incrementMinigameScore } from '../../lib/settings/settings';

export interface MinigameScore {
	minigame: Minigame;
	score: number;
}

export type Minigame = typeof Minigames[number];

export const Minigames = [
	{
		name: 'Tithe farm',
		column: 'tithe_farm'
	},
	{
		name: 'Wintertodt',
		column: 'wintertodt'
	},
	{
		name: 'Tempoross',
		column: 'tempoross'
	},
	{
		name: 'Hallowed Sepulchre',
		column: 'sepulchre'
	},
	{
		name: 'Fishing Trawler',
		column: 'fishing_trawler'
	},
	{
		name: 'Barbarian Assault',
		column: 'barb_assault'
	},
	{
		name: 'Pyramid Plunder',
		column: 'pyramid_plunder'
	},
	{
		name: 'Brimhaven Agility Arena',
		column: 'agility_arena'
	},
	{
		name: "Champions' Challenge",
		column: 'champions_challenge'
	},
	{
		name: 'Mahogany Homes',
		column: 'mahogany_homes'
	},
	{
		name: 'Gnome Restaurant',
		column: 'gnome_restaurant'
	},
	{
		name: 'Soul Wars',
		column: 'soul_wars'
	},
	{
		name: "Rogues' Den",
		column: 'rogues_den'
	},
	{
		name: 'Gauntlet',
		column: 'gauntlet'
	},
	{
		name: 'Corrupted Gauntlet',
		column: 'corrupted_gauntlet'
	},
	{
		name: 'Castle Wars',
		column: 'castle_wars'
	},
	{
		name: "Chamber's of Xeric",
		column: 'raids'
	},
	{
		name: "Chamber's of Xeric - Challenge Mode",
		column: 'raids_challenge_mode'
	},
	{
		name: 'Magic Training Arena',
		column: 'magic_training_arena'
	},
	{
		name: 'Big Chompy Bird Hunting',
		column: 'big_chompy_bird_hunting'
	},
	{
		name: 'Temple Trekking',
		column: 'temple_trekking'
	},
	{
		name: 'Pest Control',
		column: 'pest_control'
	},
	{
		name: 'Volcanic Mine',
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
