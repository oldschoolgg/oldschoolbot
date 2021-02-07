import { User } from 'discord.js';
import { Extendable, ExtendableStore, KlasaUser } from 'klasa';

import { MinigameTable } from '../../lib/typeorm/MinigameTable.entity';

export interface Minigame {
	id: number;
	name: string;
	key: MinigameKey;
}

interface MinigameScore {
	minigame: Minigame;
	score: number;
}

export type MinigameKey =
	| 'TitheFarm'
	| 'Wintertodt'
	| 'Nightmare'
	| 'Sepulchre'
	| 'FishingTrawler'
	| 'Zalcano'
	| 'BarbarianAssault'
	| 'PyramidPlunder'
	| 'AgilityArena'
	| 'ChampionsChallenge'
	| 'MahoganyHomes';

export const Minigames: Minigame[] = [
	{
		id: 20661,
		name: 'Tithe farm',
		key: 'TitheFarm'
	},
	{
		id: 20693,
		name: 'Wintertodt',
		key: 'Wintertodt'
	},
	{
		id: 9415,
		name: 'The Nightmare',
		key: 'Nightmare'
	},
	{
		id: 35236,
		name: 'Hallowed Sepulchre',
		key: 'Sepulchre'
	},
	{
		id: 9525,
		name: 'Fishing Trawler',
		key: 'FishingTrawler'
	},
	{
		id: 2312,
		name: 'Zalcano',
		key: 'Zalcano'
	},
	{
		id: 2007,
		name: 'Barbarian Assault',
		key: 'BarbarianAssault'
	},
	{
		id: 6001,
		name: 'Pyramid Plunder',
		key: 'PyramidPlunder'
	},
	{
		id: 49592,
		name: 'Brimhaven Agility Arena',
		key: 'AgilityArena'
	},
	{
		id: 95284,
		name: "Champions' Challenge",
		key: 'ChampionsChallenge'
	},
	{
		id: 20315,
		name: 'Mahogany Homes',
		key: 'MahoganyHomes'
	}
];

export enum MinigameIDsEnum {
	Wintertodt = 20693,
	Nightmare = 9415,
	Sepulchre = 35236,
	TrickOrTreat = 3719,
	FishingTrawler = 9525,
	Zalcano = 2312,
	TitheFarm = 20661,
	BarbarianAssault = 2007,
	PyramidPlunder = 6001,
	AgilityArena = 49592,
	ChampionsChallenge = 95284,
	MahoganyHomes = 20315
}

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	async getMinigameScore(this: KlasaUser, minigame: MinigameKey) {
		const MinigameEntity = await this.getMinigameEntity();
		return MinigameEntity[minigame];
	}

	async getMinigameEntity(this: KlasaUser): Promise<MinigameTable> {
		let value = await MinigameTable.findOne({ userID: this.id });
		if (!value) {
			value = new MinigameTable();
			value.userID = this.id;
			await value.save();
		}
		return value;
	}

	public async incrementMinigameScore(this: User, minigame: MinigameKey, amountToAdd = 1) {
		const UserMinigames = await this.getMinigameEntity();
		UserMinigames[minigame] += amountToAdd;
		this.log(`had Quantity[${amountToAdd}] Score added to ${minigame}`);
		await UserMinigames.save();
		return UserMinigames[minigame];
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
