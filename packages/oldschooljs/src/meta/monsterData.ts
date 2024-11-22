export enum MonsterAttribute {
	Demon = 'demon',
	Dragon = 'dragon',
	Fiery = 'fiery',
	Kalphite = 'kalphite',
	Leafy = 'leafy',
	Penance = 'penance',
	Shade = 'shade',
	Undead = 'undead',
	Vampyre = 'vampyre',
	Xerician = 'xerician'
}

export enum MonsterSlayerMaster {
	Turael = 'turael',
	Krystilia = 'krystilia',
	Mazchna = 'mazchna',
	Vannaka = 'vannaka',
	Chaeldar = 'chaeldar',
	Konar = 'konar',
	Nieve = 'nieve',
	Duradel = 'duradel'
}

export enum MonsterAttackType {
	Melee = 'melee',
	Magic = 'magic',
	Range = 'range'
}

export interface MonsterData {
	members: boolean;
	combatLevel: number;
	hitpoints?: number | null;
	maxHit?: number | null;
	attackType: MonsterAttackType[];
	attackSpeed: number | null;
	aggressive: boolean;
	poisonous?: boolean;
	immuneToPoison: boolean;
	immuneToVenom: boolean;
	attributes: MonsterAttribute[];
	category: string[];
	examineText?: string;
	wikiName: string;
	wikiURL: string;
	attackLevel: number;
	strengthLevel: number;
	defenceLevel: number;
	magicLevel: number;
	rangedLevel: number;
	attackStab: number;
	attackSlash: number;
	attackCrush: number;
	attackMagic: number;
	attackRanged: number;
	defenceStab: number;
	defenceSlash: number;
	defenceCrush: number;
	defenceMagic: number;
	defenceRanged: number;
	attackAccuracy: number;
	meleeStrength: number;
	rangedStrength: number;
	magicDamage: number;
	isSlayerMonster: boolean;
	slayerLevelRequired: number;
	slayerXP: number;
	assignableSlayerMasters: MonsterSlayerMaster[];
}
