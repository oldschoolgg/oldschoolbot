import type { NewBossOptions } from '@/lib/bso/bsoTypes.js';
import { clAdjustedDroprate } from '@/lib/bso/bsoUtil.js';
import { isDoubleLootActive } from '@/lib/bso/doubleLoot.js';
import { globalDroprates } from '@/lib/bso/globalDroprates.js';
import { VasaMagus, VasaMagusLootTable } from '@/lib/bso/monsters/bosses/VasaMagus.js';
import { Malygos } from '@/lib/bso/monsters/demi-bosses/Malygos.js';
import { SeaKraken } from '@/lib/bso/monsters/demi-bosses/SeaKraken.js';
import { Treebeard } from '@/lib/bso/monsters/demi-bosses/Treebeard.js';

import { objectEntries } from '@oldschoolgg/toolkit';
import { Bank, Items, Monsters, resolveItems } from 'oldschooljs';

import { kittens } from '@/lib/growablePets.js';
import { trackLoot } from '@/lib/lootTrack.js';
import { bossKillables } from '@/lib/minions/data/killableMonsters/bosses/index.js';
import announceLoot from '@/lib/minions/functions/announceLoot.js';

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
	Malygos,
	Treebeard,
	SeaKraken,
	...bossKillables.map(b => b.id).map(id => Monsters.get(id)!)
];

export const vasaTask: MinionTask = {
	type: 'VasaMagus',
	async run(data: NewBossOptions, { user, handleTripFinish, rng }) {
		const { channelId, duration, quantity } = data;

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
			if (rng.roll(petDroprate)) loot.add('Voidling');
			const mon = rng.pick(vasaBosses);
			const qty = rng.randInt(1, 3);
			lootOf[mon.name] = (lootOf[mon.name] ?? 0) + qty;
			if ('table' in mon) {
				loot.add(mon.table.roll(qty));
			} else if ('kill' in mon && mon.kill) {
				loot.add(mon.kill(qty, {}));
			}
		}

		let message = new MessageBuilder().setContent(`${user}, ${user.minionName
			} finished killing ${quantity}x Vasa Magus.\nVasa dropped the loot of ${objectEntries(lootOf)
				.map(l => `${l[1]}x ${l[0]}`)
				.join(', ')}`);

		if (isDoubleLootActive(duration)) {
			loot.multiply(2);
		}

		const pet = user.user.minion_equippedPet;
		if (pet && kittens.includes(pet) && rng.roll(1)) {
			await user.addItemsToCollectionLog({
				itemsToAdd: new Bank().add('Magic kitten'),
				otherUpdates: {
					minion_equippedPet: Items.getOrThrow('Magic kitten').id
				}
			});
			message.addContent(`\n**Vasa cast a spell on you, but your ${Items.itemNameFromId(
				pet
			)} jumped in the way to save you! Strangely, it didn't hurt them at all.**\n`);
		}

		const xpRes = await user.addMonsterXP({
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

		message.addContent(`\n${xpRes}\n`);
		message.addBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity} ${VasaMagus.name}`,
			user,
			previousCL
		})

		announceLoot({
			user,
			monsterID: VasaMagus.id,
			loot,
			notifyDrops: resolveItems(['Magus scroll', 'Voidling', 'Tattered robes of Vasa'])
		});

		await ClientSettings.updateBankSetting('vasa_loot', loot);

		return handleTripFinish({ user, channelId, message, data, loot: itemsAdded });
	}
};
