import { User } from 'discord.js';
import { Extendable, ExtendableStore, KlasaUser } from 'klasa';
import { EntityFieldsNames } from 'typeorm/common/EntityFieldsNames';

import { getMinigameEntity, incrementMinigameScore } from '../../lib/settings/settings';
import { MinigameTable } from '../../lib/typeorm/MinigameTable.entity';

export interface Minigame {
	id: number;
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
		id: 20661,
		name: 'Tithe farm',
		key: 'TitheFarm',
		column: 'tithe_farm'
	},
	{
		id: 20693,
		name: 'Wintertodt',
		key: 'Wintertodt',
		column: 'wintertodt'
	},
	{
		id: 35236,
		name: 'Hallowed Sepulchre',
		key: 'Sepulchre',
		column: 'sepulchre'
	},
	{
		id: 9525,
		name: 'Fishing Trawler',
		key: 'FishingTrawler',
		column: 'fishing_trawler'
	},
	{
		id: 2007,
		name: 'Barbarian Assault',
		key: 'BarbarianAssault',
		column: 'barb_assault'
	},
	{
		id: 6001,
		name: 'Pyramid Plunder',
		key: 'PyramidPlunder',
		column: 'pyramid_plunder'
	},
	{
		id: 49592,
		name: 'Brimhaven Agility Arena',
		key: 'AgilityArena',
		column: 'agility_arena'
	},
	{
		id: 95284,
		name: "Champions' Challenge",
		key: 'ChampionsChallenge',
		column: 'champions_challenge'
	},
	{
		id: 20315,
		name: 'Mahogany Homes',
		key: 'MahoganyHomes',
		column: 'mahogany_homes'
	},
	{
		id: 6969,
		name: 'Chambers of Xeric',
		key: 'Raids'
	},
	{
		id: 52362,
		name: 'Gnome Restaurant',
		key: 'GnomeRestaurant',
		column: 'gnome_restaurant'
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
