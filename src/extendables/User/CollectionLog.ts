import { User } from 'discord.js';
import { calcWhatPercent } from 'e';
import { Extendable, ExtendableStore, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { MersenneTwister19937, shuffle } from 'random-js';

import { allClItems, clIntoBank } from '../../lib/data/Collections';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ItemBank } from '../../lib/types';
import { addBanks } from '../../lib/util';

export function shuffleRandom<T>(input: number, arr: T[]): T[] {
	const engine = MersenneTwister19937.seed(input);
	return shuffle(engine, [...arr]);
}

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	// @ts-ignore 2784
	public completion(this: User) {
		const clItems = Object.keys(this.settings.get(UserSettings.CollectionLogBank)).map(i => parseInt(i));
		const debugBank = new Bank();
		debugBank.add(clIntoBank(allClItems));
		const owned = clItems.filter(i => allClItems.includes(i));
		const notOwned = shuffleRandom(
			Number(this.id),
			allClItems.filter(i => !clItems.includes(i))
		).slice(0, 10);
		return {
			percent: calcWhatPercent(owned.length, allClItems.length),
			notOwned,
			owned,
			debugBank
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
