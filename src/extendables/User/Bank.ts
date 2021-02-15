import { User } from 'discord.js';
import { Extendable, ExtendableStore, SettingsFolder } from 'klasa';
import { Bank } from 'oldschooljs';
import { O } from 'ts-toolbelt';

import { Events } from '../../lib/constants';
import SimilarItems from '../../lib/data/similarItems';
import { GearTypes } from '../../lib/gear';
import clueTiers from '../../lib/minions/data/clueTiers';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ItemBank } from '../../lib/types';
import { addBanks, addItemToBank, removeBankFromBank, removeItemFromBank } from '../../lib/util';

export interface GetUserBankOptions {
	withGP?: boolean;
}

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	public bank(this: User, { withGP = false }: GetUserBankOptions = {}) {
		const bank = new Bank(this.settings.get(UserSettings.Bank));
		if (withGP) bank.add('Coins', this.settings.get(UserSettings.GP));
		return bank;
	}

	public numOfItemsOwned(this: User, itemID: number) {
		const bank = this.settings.get(UserSettings.Bank);

		let numOwned = 0;

		if (typeof bank[itemID] !== 'undefined') {
			numOwned += bank[itemID];
		}

		const gear = (this.settings.get('gear') as SettingsFolder).toJSON() as {
			[key: string]: GearTypes.GearSetup;
		};

		for (const setup of Object.values(gear)) {
			const thisItemEquipped = Object.values(setup).find(setup => setup?.item === itemID);
			if (thisItemEquipped) numOwned += thisItemEquipped.quantity;
		}

		return numOwned;
	}

	public numItemsInBankSync(this: User, itemID: number, similar = false) {
		const bank = this.settings.get(UserSettings.Bank);
		const itemQty = typeof bank[itemID] !== 'undefined' ? bank[itemID] : 0;
		if (similar && itemQty === 0 && SimilarItems[itemID]) {
			for (const i of SimilarItems[itemID]) {
				if (bank[i] && bank[i] > 0) return bank[i];
			}
		}
		return itemQty;
	}

	public allItemsOwned(this: User): ItemBank {
		let totalBank = { ...this.settings.get(UserSettings.Bank) };

		for (const setup of Object.values(this.rawGear())) {
			for (const equipped of Object.values(setup)) {
				if (equipped?.item) {
					totalBank = addItemToBank(totalBank, equipped.item, equipped.quantity);
				}
			}
		}

		const equippedPet = this.settings.get(UserSettings.Minion.EquippedPet);
		if (equippedPet) {
			totalBank = addItemToBank(totalBank, equippedPet, 1);
		}

		return totalBank;
	}

	public async removeGP(this: User, amount: number) {
		await this.settings.sync(true);
		const currentGP = this.settings.get(UserSettings.GP);
		if (currentGP < amount) throw `${this.sanitizedName} doesn't have enough GP.`;
		this.log(
			`had ${amount} GP removed. BeforeBalance[${currentGP}] NewBalance[${
				currentGP - amount
			}]`
		);
		return this.queueFn(() => this.settings.update(UserSettings.GP, currentGP - amount));
	}

	public async addGP(this: User, amount: number) {
		await this.settings.sync(true);
		const currentGP = this.settings.get(UserSettings.GP);
		this.log(
			`had ${amount} GP added. BeforeBalance[${currentGP}] NewBalance[${currentGP + amount}]`
		);
		return this.queueFn(() => this.settings.update(UserSettings.GP, currentGP + amount));
	}

	public async addItemsToBank(this: User, inputItems: ItemBank | Bank, collectionLog = false) {
		const _items = inputItems instanceof Bank ? { ...inputItems.bank } : inputItems;

		await this.settings.sync(true);
		for (const { scrollID } of clueTiers) {
			// If they didnt get any of this clue scroll in their loot, continue to next clue tier.
			if (!_items[scrollID]) continue;
			const alreadyHasThisScroll = await this.hasItem(scrollID);
			if (alreadyHasThisScroll) {
				// If they already have this scroll in their bank, delete it from the loot.
				delete _items[scrollID];
			} else {
				// If they dont have it in their bank, reset the amount to 1 incase they got more than 1 of the clue.
				_items[scrollID] = 1;
			}
		}

		const items = {
			..._items
		};

		if (collectionLog) this.addItemsToCollectionLog(items);

		if (items[995]) {
			await this.addGP(items[995]);
			delete items[995];
		}

		this.log(`Had items added to bank - ${JSON.stringify(items)}`);
		return this.queueFn(() =>
			this.settings.update(
				UserSettings.Bank,
				addBanks([
					items,
					{
						...this.settings.get(UserSettings.Bank)
					}
				])
			)
		);
	}

	public async removeItemFromBank(this: User, itemID: number, amountToRemove = 1) {
		await this.settings.sync(true);
		const bank = { ...this.settings.get(UserSettings.Bank) };
		if (typeof bank[itemID] === 'undefined' || bank[itemID] < amountToRemove) {
			this.client.emit(
				Events.Wtf,
				`${this.username}[${this.id}] [NEI] ${itemID} ${amountToRemove}`
			);

			throw `${this.username}[${this.id}] doesn't have enough of item[${itemID}] to remove ${amountToRemove}.`;
		}

		this.log(`had Quantity[${amountToRemove}] of ItemID[${itemID}] removed from bank.`);
		return this.queueFn(() =>
			this.settings.update(
				UserSettings.Bank,
				removeItemFromBank(bank, itemID, amountToRemove)
			)
		);
	}

	public async removeItemsFromBank(this: User, itemBank: O.Readonly<ItemBank>) {
		await this.settings.sync(true);

		const items = {
			...itemBank
		};

		if (items[995]) {
			await this.removeGP(items[995]);
			delete items[995];
		}

		this.log(`Had items removed from bank - ${JSON.stringify(items)}`);
		return this.queueFn(() =>
			this.settings.update(
				UserSettings.Bank,
				removeBankFromBank(this.settings.get(UserSettings.Bank), items)
			)
		);
	}

	public async hasItem(this: User, itemID: number, amount = 1, sync = true) {
		if (sync) await this.settings.sync(true);

		const bank = this.settings.get(UserSettings.Bank);
		return typeof bank[itemID] !== 'undefined' && bank[itemID] >= amount;
	}

	public async numberOfItemInBank(this: User, itemID: number, sync = true) {
		if (sync) await this.settings.sync(true);

		const bank = this.settings.get(UserSettings.Bank);
		return typeof bank[itemID] !== 'undefined' ? bank[itemID] : 0;
	}
}
