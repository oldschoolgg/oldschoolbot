import { User } from 'discord.js';
import { calcWhatPercent, uniqueArr } from 'e';
import { Extendable, ExtendableStore, KlasaUser } from 'klasa';
import { MersenneTwister19937, shuffle } from 'random-js';

import { collectionLogTypes } from '../../lib/data/collectionLog';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ItemBank } from '../../lib/types';
import { addBanks } from '../../lib/util';

export function shuffleRandom<T>(input: number, arr: T[]): T[] {
	const engine = MersenneTwister19937.seed(input);
	return shuffle(engine, [...arr]);
}

const allCollectionLogItems = uniqueArr(
	collectionLogTypes
		.filter(i => !['Holiday', 'Diango', 'Overall', 'Capes', 'Clue Hunter'].includes(i.name))
		.map(i => Object.values(i.items))
		.flat(Infinity) as number[]
);

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	// @ts-ignore 2784
	public completion(this: User) {
		const clItems = Object.keys(this.settings.get(UserSettings.CollectionLogBank)).map(i =>
			parseInt(i)
		);
		const owned = clItems.filter(i => allCollectionLogItems.includes(i));
		const notOwned = shuffleRandom(
			Number(this.id),
			allCollectionLogItems.filter(i => !clItems.includes(i))
		).slice(0, 10);
		return {
			percent: calcWhatPercent(owned.length, allCollectionLogItems.length),
			notOwned,
			owned
		};
	}

	// @ts-ignore 2784
	public get collectionLog(this: User) {
		return this.settings.get(UserSettings.CollectionLogBank);
	}

	getCL(this: KlasaUser, itemID: number) {
		return this.settings.get(UserSettings.CollectionLogBank)[itemID] ?? 0;
	}

	public async addItemsToCollectionLog(this: User, items: ItemBank) {
		await this.settings.sync(true);
		this.log(`had following items added to collection log: [${JSON.stringify(items)}`);

		return this.settings.update(
			UserSettings.CollectionLogBank,
			addBanks([
				items,
				{
					...this.settings.get(UserSettings.CollectionLogBank)
				}
			])
		);
	}
}
