import { User } from 'discord.js';
import { Extendable, ExtendableStore, KlasaUser } from 'klasa';
import { EntityFieldsNames } from 'typeorm/common/EntityFieldsNames';

import { getMinigameEntity, incrementMinigameScore } from '../../lib/settings/settings';
import { MinigameTable } from '../../lib/typeorm/MinigameTable.entity';

export interface Minigame {
	name: string;
	aliases: string[];
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
		aliases: ['tf', 'tithe'],
		key: 'TitheFarm',
		column: 'tithe_farm'
	},
	{
		name: 'Wintertodt',
		aliases: ['wt'],
		key: 'Wintertodt',
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
		key: 'Sepulchre',
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
		key: 'BigChompyBirdHunting',
		column: 'big_chompy_bird_hunting'
	},
	{
		name: 'Temple Trekking',
		aliases: ['tt', 'trek'],
		key: 'TempleTrekking',
		column: 'temple_trekking'
	},
	{
		name: 'Pest Control',
		aliases: ['pest', 'pc'],
		key: 'PestControl',
		column: 'pest_control'
	},
	{
		name: 'Volcanic Mine',
		aliases: ['vm'],
		key: 'VolcanicMine',
		column: 'volcanic_mine'
	},
	{
		name: 'Inferno',
		aliases: ['inferno', 'zuk'],
		key: 'Inferno',
		column: 'inferno'
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
