import { User } from 'discord.js';
import { percentChance } from 'e';
import { Extendable, ExtendableStore } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { projectiles } from '../../lib/constants';
import { blowpipeDarts, validateBlowpipeData } from '../../lib/minions/functions/blowpipeCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { filterLootReplace } from '../../lib/slayer/slayerUtil';
import { ItemBank } from '../../lib/types';
import {
	bankHasAllItemsFromBank,
	deduplicateClueScrolls,
	itemNameFromID,
	removeBankFromBank,
	sanitizeBank
} from '../../lib/util';
import { determineRunes } from '../../lib/util/determineRunes';
import itemID from '../../lib/util/itemID';

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

	public allItemsOwned(this: User): Bank {
		let totalBank = this.bank({ withGP: true });

		for (const setup of Object.values(this.rawGear())) {
			for (const equipped of Object.values(setup)) {
				if (equipped?.item) {
					totalBank.add(equipped.item, equipped.quantity);
				}
			}
		}

		const equippedPet = this.settings.get(UserSettings.Minion.EquippedPet);
		if (equippedPet) {
			totalBank.add(equippedPet);
		}

		return totalBank;
	}

	public async removeGP(this: User, amount: number) {
		await this.settings.sync(true);
		const currentGP = this.settings.get(UserSettings.GP);
		if (currentGP < amount) throw `${this.sanitizedName} doesn't have enough GP.`;
		this.log(`had ${amount} GP removed. BeforeBalance[${currentGP}] NewBalance[${currentGP - amount}]`);
		this.settings.update(UserSettings.GP, currentGP - amount);
	}

	public async addGP(this: User, amount: number) {
		await this.settings.sync(true);
		const currentGP = this.settings.get(UserSettings.GP);
		this.log(`had ${amount} GP added. BeforeBalance[${currentGP}] NewBalance[${currentGP + amount}]`);
		return this.settings.update(UserSettings.GP, currentGP + amount);
	}

	public async addItemsToBank(
		this: User,
		{
			items,
			collectionLog = false,
			filterLoot = true,
			dontAddToTempCL = false
		}: { items: ItemBank | Bank; collectionLog?: boolean; filterLoot?: boolean; dontAddToTempCL?: boolean }
	): Promise<{ previousCL: Bank; itemsAdded: Bank }> {
		return this.queueFn(async user => {
			await this.settings.sync(true);
			let loot = deduplicateClueScrolls({
				loot: items instanceof Bank ? items.clone() : new Bank(items),
				currentBank: user.bank()
			});

			sanitizeBank(loot);

			const previousCL = user.cl();

			const { bankLoot, clLoot } = filterLoot
				? filterLootReplace(user.allItemsOwned(), loot)
				: { bankLoot: loot, clLoot: loot };
			loot = bankLoot;
			if (collectionLog) {
				await user.addItemsToCollectionLog({ items: clLoot, dontAddToTempCL });
			}

			// Get the amount of coins in the loot and remove the coins from the items to be added to the user bank
			const coinsInLoot = loot.amount('Coins');
			if (coinsInLoot > 0) {
				await user.addGP(loot.amount('Coins'));
				loot.remove('Coins', loot.amount('Coins'));
			}

			const newBank = user.bank().add(loot).bank;

			await this.settings.update(UserSettings.Bank, newBank);

			// Re-add the coins to the loot
			if (coinsInLoot > 0) loot.add('Coins', coinsInLoot);

			return {
				previousCL,
				itemsAdded: loot
			};
		});
	}

	public async removeItemsFromBank(this: User, _itemBank: Readonly<ItemBank>) {
		return this.queueFn(async user => {
			const itemBank = _itemBank instanceof Bank ? { ..._itemBank.bank } : _itemBank;

			await user.settings.sync(true);

			const currentBank = user.settings.get(UserSettings.Bank);
			const GP = user.settings.get(UserSettings.GP);
			if (!bankHasAllItemsFromBank({ ...currentBank, 995: GP }, itemBank)) {
				throw new Error(
					`Tried to remove ${new Bank(itemBank)} from ${
						user.username
					} but failed because they don't own all these items.`
				);
			}

			const items = {
				...itemBank
			};

			if (items[995]) {
				await user.removeGP(items[995]);
				delete items[995];
			}
			if (Object.keys(items).length === 0) return;

			user.log(`Had items removed from bank - ${JSON.stringify(items)}`);
			return user.settings.update(UserSettings.Bank, removeBankFromBank(currentBank, items));
		});
	}

	public async specialRemoveItems(this: User, _bank: Bank) {
		const bank = determineRunes(this, _bank);
		const bankRemove = new Bank();
		let dart: [Item, number] | null = null;
		let ammoRemove: [Item, number] | null = null;

		const realCost = bank.clone();
		const rangeGear = this.getGear('range');
		const hasAvas = rangeGear.hasEquipped("Ava's assembler");

		for (const [item, quantity] of bank.items()) {
			if (blowpipeDarts.includes(item)) {
				if (dart !== null) throw new Error('Tried to remove more than 1 blowpipe dart.');
				dart = [item, quantity];
				continue;
			}
			if (Object.values(projectiles).flat(2).includes(item.id)) {
				if (ammoRemove !== null) throw new Error('Tried to remove more than 1 ranged ammunition.');
				ammoRemove = [item, quantity];
				continue;
			}
			bankRemove.add(item.id, quantity);
		}

		const removeFns: (() => Promise<unknown>)[] = [];

		if (ammoRemove) {
			const equippedAmmo = rangeGear.ammo?.item;
			if (!equippedAmmo) {
				throw new Error('No ammo equipped.');
			}
			if (equippedAmmo !== ammoRemove[0].id) {
				throw new Error(`Has ${itemNameFromID(equippedAmmo)}, but needs ${ammoRemove[0].name}.`);
			}
			const newRangeGear = { ...this.settings.get(UserSettings.Gear.Range) };
			const ammo = newRangeGear.ammo?.quantity;

			if (hasAvas) {
				let ammoCopy = ammoRemove[1];
				for (let i = 0; i < ammoCopy; i++) {
					if (percentChance(80)) {
						ammoRemove[1]--;
						realCost.remove(ammoRemove[0].id, 1);
					}
				}
			}
			if (!ammo || ammo < ammoRemove[1])
				throw new Error(
					`Not enough ${ammoRemove[0].name} equipped in range gear, you need ${
						ammoRemove![1]
					} but you have only ${ammo}.`
				);
			removeFns.push(() => {
				newRangeGear.ammo!.quantity -= ammoRemove![1];
				return this.settings.update(UserSettings.Gear.Range, newRangeGear);
			});
		}

		if (dart) {
			if (hasAvas) {
				let copyDarts = dart![1];
				for (let i = 0; i < copyDarts; i++) {
					if (percentChance(80)) {
						realCost.remove(dart[0].id, 1);
						dart![1]--;
					}
				}
			}
			const scales = Math.ceil((10 / 3) * dart[1]);
			const rawBlowpipeData = this.settings.get(UserSettings.Blowpipe);
			if (!this.owns('Toxic blowpipe') || !rawBlowpipeData) {
				throw new Error("You don't have a Toxic blowpipe.");
			}
			if (!rawBlowpipeData.dartID || !rawBlowpipeData.dartQuantity) {
				throw new Error('You have no darts in your Toxic blowpipe.');
			}
			if (rawBlowpipeData.dartQuantity < dart[1]) {
				throw new Error(
					`You don't have enough ${itemNameFromID(
						rawBlowpipeData.dartID
					)}s in your Toxic blowpipe, you need ${dart[1]}, but you have only ${rawBlowpipeData.dartQuantity}.`
				);
			}
			if (!rawBlowpipeData.scales || rawBlowpipeData.scales < scales) {
				throw new Error(
					`You don't have enough Zulrah's scales in your Toxic blowpipe, you need ${scales} but you have only ${rawBlowpipeData.scales}.`
				);
			}
			removeFns.push(() => {
				const bpData = { ...this.settings.get(UserSettings.Blowpipe) };
				bpData.dartQuantity -= dart![1];
				bpData.scales -= scales;
				validateBlowpipeData(bpData);
				return this.settings.update(UserSettings.Blowpipe, bpData);
			});
		}

		if (bankRemove.length > 0) {
			if (!this.owns(bankRemove)) {
				throw new Error(`You don't own: ${bankRemove.clone().remove(this.bank())}.`);
			}
			removeFns.push(() => {
				return this.removeItemsFromBank(bankRemove);
			});
		}

		const promises = removeFns.map(fn => fn());
		await Promise.all(promises);
		return {
			realCost
		};
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

	public owns(this: User, bank: ItemBank | Bank | string | number) {
		if (typeof bank === 'string' || typeof bank === 'number') {
			return Boolean(this.settings.get(UserSettings.Bank)[typeof bank === 'number' ? bank : itemID(bank)]);
		}
		const itemBank = bank instanceof Bank ? { ...bank.bank } : bank;
		return bankHasAllItemsFromBank(
			{ ...this.settings.get(UserSettings.Bank), 995: this.settings.get(UserSettings.GP) },
			itemBank
		);
	}
}
