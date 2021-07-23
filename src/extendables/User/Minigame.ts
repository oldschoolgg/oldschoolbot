import { User } from 'discord.js';
import { Extendable, ExtendableStore, KlasaUser } from 'klasa';
import { EntityFieldsNames } from 'typeorm/common/EntityFieldsNames';

import { getMinigameEntity, incrementMinigameScore } from '../../lib/settings/settings';
import { MinigameTable } from '../../lib/typeorm/MinigameTable.entity';

export interface Minigame {
	name: string;
	key: MinigameKey;
	column: string;
}

export interface MinigameScore {
	minigame: Minigame;
	score: number;
}

export type MinigameKey = EntityFieldsNames<Omit<MinigameTable, 'userID' | 'id'>>;

export const Minigames: Minigame[] = [
	{
		name: 'Tithe farm',
		key: 'TitheFarm',
		column: 'tithe_farm'
	},
	{
		name: 'Wintertodt',
		key: 'Wintertodt',
		column: 'wintertodt'
	},
	{
		name: 'Tempoross',
		key: 'Tempoross',
		column: 'tempoross'
	},
	{
		name: 'Hallowed Sepulchre',
		key: 'Sepulchre',
		column: 'sepulchre'
	},
	{
		name: 'Fishing Trawler',
		key: 'FishingTrawler',
		column: 'fishing_trawler'
	},
	{
		name: 'Barbarian Assault',
		key: 'BarbarianAssault',
		column: 'barb_assault'
	},
	{
		name: 'Pyramid Plunder',
		key: 'PyramidPlunder',
		column: 'pyramid_plunder'
	},
	{
		name: 'Brimhaven Agility Arena',
		key: 'AgilityArena',
		column: 'agility_arena'
	},
	{
		name: "Champions' Challenge",
		key: 'ChampionsChallenge',
		column: 'champions_challenge'
	},
	{
		name: 'Mahogany Homes',
		key: 'MahoganyHomes',
		column: 'mahogany_homes'
	},
	{
		name: 'Gnome Restaurant',
		key: 'GnomeRestaurant',
		column: 'gnome_restaurant'
	},
	{
		name: 'Soul Wars',
		key: 'SoulWars',
		column: 'soul_wars'
	},
	{
		name: "Rogues' Den",
		key: 'RoguesDenMaze',
		column: 'rogues_den'
	},
	{
		name: 'Gauntlet',
		key: 'Gauntlet',
		column: 'gauntlet'
	},
	{
		name: 'Corrupted Gauntlet',
		key: 'CorruptedGauntlet',
		column: 'corrupted_gauntlet'
	},
	{
		name: 'Castle Wars',
		key: 'CastleWars',
		column: 'castle_wars'
	},
	{
		name: "Chamber's of Xeric",
		key: 'Raids',
		column: 'raids'
	},
	{
		name: "Chamber's of Xeric - Challenge Mode",
		key: 'RaidsChallengeMode',
		column: 'raids_challenge_mode'
	},
	{
		name: 'Magic Training Arena',
		key: 'MagicTrainingArena',
		column: 'magic_training_arena'
	},
	{
		name: 'Big Chompy Bird Hunting',
		key: 'BigChompyBirdHunting',
		column: 'big_chompy_bird_hunting'
	},
	{
		name: 'Temple Trekking',
		key: 'TempleTrekking',
		column: 'temple_trekking'
	}
];

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	async getMinigameScore(this: KlasaUser, minigame: MinigameKey) {
		const MinigameEntity = await this.getMinigameEntity();
		return MinigameEntity[minigame];
	}

	async getMinigameEntity(this: KlasaUser): Promise<MinigameTable> {
		return getMinigameEntity(this.id);
	}

	public async incrementMinigameScore(this: User, minigame: MinigameKey, amountToAdd = 1) {
		return incrementMinigameScore(this.id, minigame, amountToAdd);
	}

	async getAllMinigameScores(this: User): Promise<MinigameScore[]> {
		const UserMinigames = await this.getMinigameEntity();
		const scores: MinigameScore[] = [];
		for (const minigame of Minigames) {
			const score = UserMinigames[minigame.key];
			scores.push({ minigame, score });
		}
		return scores;
	}
}
