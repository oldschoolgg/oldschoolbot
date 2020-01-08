import { Monsters } from 'oldschooljs';

export const enum Time {
	Millisecond = 1,
	Second = 1000,
	Minute = 1000 * 60,
	Hour = 1000 * 60 * 60,
	Day = 1000 * 60 * 60 * 24,
	Month = 1000 * 60 * 60 * 24 * 30,
	Year = 1000 * 60 * 60 * 24 * 365
}

export const enum Channel {
	Notifications = '469523207691436042'
}

export const enum Emoji {
	MoneyBag = '<:MoneyBag:493286312854683654>',
	OSBot = '<:OSBot:601768469905801226>',
	Joy = '😂',
	Bpaptu = '<:bpaptu:660333438292983818>',
	Diamond = '💎',
	Dice = '<:dice:660128887111548957>',
	Minion = '<:minion:660517408968146946>',
	Fireworks = '🎆',
	Tick = '✅',
	Search = '🔎',
	FancyLoveheart = '💝',
	Gift = '🎁'
}

export const enum Image {
	DiceBag = 'https://i.imgur.com/sySQkSX.png'
}

export const enum Color {
	Orange = 16098851
}

export const SupportServer = '342983479501389826';

export const KillableMonsters = [
	{
		id: Monsters.Cerberus.id,
		name: Monsters.Cerberus.name,
		aliases: ['cerb'],
		timeToFinish: Time.Minute * 2,
		table: Monsters.Cerberus
	},
	{
		id: Monsters.GiantMole.id,
		name: Monsters.GiantMole.name,
		aliases: ['mole'],
		timeToFinish: Time.Minute * 1.5,
		table: Monsters.GiantMole
	},
	{
		id: Monsters.Zulrah.id,
		name: Monsters.Zulrah.name,
		aliases: ['snek'],
		timeToFinish: Time.Minute * 2.5,
		table: Monsters.Zulrah
	}
];

export const enum Tasks {
	MonsterActivity = 'monsterActivity'
}

export const enum Activity {
	MonsterKilling = 'MonsterKilling'
}

export const enum UserSettings {
	MinionName = 'minion.name',
	MinionHasBought = 'minion.hasBought',
	GP = 'GP'
}
