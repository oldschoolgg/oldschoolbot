import { Minigame } from '../types';

export const Minigames: Minigame[] = [
	{
		id: 20693,
		name: 'Wintertodt'
	},
	{
		id: 24207,
		name: 'Last Man Standing wins'
	},
	{
		id: 8721,
		name: 'Last Man Standing points'
	}
];

export enum MinigameIDsEnum {
	Wintertodt = 20693, // phoenix pet id
	LMS_wins = 24207, // victor's cape id
	LMS_points = 8721 // Justine npc id, owner of LMS rewards shop
}
