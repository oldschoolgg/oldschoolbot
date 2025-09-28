import { clAdjustedDroprate, getMonster } from '@/lib/bso/bsoUtil.js';
import { isDoubleLootActive } from '@/lib/bso/doubleLoot.js';
import { globalDroprates } from '@/lib/bso/globalDroprates.js';

import { objectEntries, randArrItem, randInt, roll } from '@oldschoolgg/toolkit';
import { Bank, Items, Monsters, resolveItems } from 'oldschooljs';

import { kittens } from '@/lib/growablePets.js';
import { trackLoot } from '@/lib/lootTrack.js';
import { bossKillables } from '@/lib/minions/data/killableMonsters/bosses/index.js';
import { VasaMagus, VasaMagusLootTable } from '@/lib/minions/data/killableMonsters/custom/bosses/VasaMagus.js';
import announceLoot from '@/lib/minions/functions/announceLoot.js';
import { addMonsterXP } from '@/lib/minions/functions/index.js';
import type { NewBossOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { updateBankSetting } from '@/lib/util/updateBankSetting.js';

const vasaBosses = [
	Monsters.AbyssalSire,
	Monsters.AlchemicalHydra,
	Monsters.Barrows,
	Monsters.DagannothPrime,
	Monsters.DagannothRex,
	Monsters.DagannothSupreme,
	Monsters.GrotesqueGuardians,
	Monsters.Kraken,
	Monsters.Sarachnis,
	Monsters.ThermonuclearSmokeDevil,
	getMonster('Malygos'),
	getMonster('Treebeard'),
	getMonster('Sea Kraken'),
	...bossKillables.map(b => b.id).map(id => Monsters.get(id)!)
];

export const vasaTask: MinionTask = {
	type: 'VasaMagus',
	async run(data: NewBossOptions) {
		const { channelID, userID, duration, quantity } = data;
		const user = await mUserFetch(userID);

		await user.incrementKC(VasaMagus.id, quantity);

		const loot = new Bank();

		const lootOf: Record<string, number> = {};

		const petDroprate = clAdjustedDroprate(
			user,
			'Voidling',
			globalDroprates.voidling.baseRate,
			globalDroprates.voidling.clIncrease
		);
		for (let i = 0; i < quantity; i++) {
			loot.add(VasaMagusLootTable.roll());
			if (roll(petDroprate)) loot.add('Voidling');
			const mon = randArrItem(vasaBosses);
			const qty = randInt(1, 3);
			lootOf[mon.name] = (lootOf[mon.name] ?? 0) + qty;
			loot.add(mon.kill(qty, {}));
		}

		let resultStr = `${user}, ${
			user.minionName
		} finished killing ${quantity}x Vasa Magus.\nVasa dropped the loot of ${objectEntries(lootOf)
			.map(l => `${l[1]}x ${l[0]}`)
			.join(', ')}`;

		if (isDoubleLootActive(duration)) {
			loot.multiply(2);
		}

		const pet = user.user.minion_equippedPet;
		if (pet && kittens.includes(pet) && roll(1)) {
			await user.update({
				minion_equippedPet: Items.getOrThrow('Magic kitten').id
			});
			await user.addItemsToCollectionLog(new Bank().add('Magic kitten'));
			resultStr += `\n**Vasa cast a spell on you, but your ${Items.itemNameFromId(
				pet
			)} jumped in the way to save you! Strangely, it didn't hurt them at all.**\n`;
		}

		const xpRes = await addMonsterXP(user, {
			monsterID: VasaMagus.id,
			quantity,
			duration,
			isOnTask: false,
			taskQuantity: null
		});
		const { previousCL, itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: true });
		await trackLoot({
			duration,
			totalLoot: loot,
			type: 'Monster',
			changeType: 'loot',
			id: VasaMagus.name,
			kc: quantity,
			users: [
				{
					id: user.id,
					loot,
					duration
				}
			]
		});
		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity} ${VasaMagus.name}`,
			user,
			previousCL
		});

		resultStr += `\n${xpRes}\n`;

		announceLoot({
			user,
			monsterID: VasaMagus.id,
			loot,
			notifyDrops: resolveItems(['Magus scroll', 'Voidling', 'Tattered robes of Vasa'])
		});

		updateBankSetting('vasa_loot', loot);

		handleTripFinish(user, channelID, resultStr, image.file.attachment, data, itemsAdded);
	}
};
