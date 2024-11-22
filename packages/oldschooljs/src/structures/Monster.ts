import rawMonsterData from '../data/monsters_data.json' assert { type: 'json' };
import type { MonsterData } from '../meta/monsterData';
import type { MonsterKillOptions, MonsterOptions } from '../meta/types';
import type Bank from './Bank';

const monsterData = rawMonsterData as { [key: string]: MonsterData };

export default abstract class Monster {
	public id: number;
	public name: string;
	public aliases: string[];
	public data: MonsterData;
	public allItems: number[];
	public abstract kill(quantity: number, options: MonsterKillOptions): Bank;

	constructor(options: MonsterOptions) {
		this.id = options.id;
		this.name = options.name;
		this.aliases = options.aliases ?? [];
		this.data = monsterData[this.id];
		this.allItems = options.allItems ?? [];
		const pluralName = `${this.name.toLowerCase()}s`;
		if (!this.aliases.includes(pluralName)) {
			this.aliases.push(pluralName);
		}
	}
}
