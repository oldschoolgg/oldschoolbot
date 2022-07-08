import { objectEntries, randArrItem, randInt, roll } from 'e';
import { Task } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';
import Monster from 'oldschooljs/dist/structures/Monster';

import { isDoubleLootActive } from '../../../lib/doubleLoot';
import { kittens } from '../../../lib/growablePets';
import { bossKillables } from '../../../lib/minions/data/killableMonsters/bosses';
import { VasaMagus, VasaMagusLootTable } from '../../../lib/minions/data/killableMonsters/custom/bosses/VasaMagus';
import { addMonsterXP } from '../../../lib/minions/functions';
import announceLoot from '../../../lib/minions/functions/announceLoot';
import { trackLoot } from '../../../lib/settings/prisma';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { NewBossOptions } from '../../../lib/types/minions';
import { getMonster, itemNameFromID, updateBankSetting } from '../../../lib/util';
import getOSItem from '../../../lib/util/getOSItem';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import resolveItems from '../../../lib/util/resolveItems';

const vasaBosses: Monster[] = [
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

export default class extends Task {
	async run(data: NewBossOptions) {
		const { channelID, userID, duration, quantity } = data;
		const user = await this.client.fetchUser(userID);

		await user.incrementMonsterScore(VasaMagus.id, quantity);

		const loot = new Bank();

		const lootOf: Record<string, number> = {};
		for (let i = 0; i < quantity; i++) {
			loot.add(VasaMagusLootTable.roll());
			let mon = randArrItem(vasaBosses);
			let qty = randInt(1, 3);
			lootOf[mon.name] = (lootOf[mon.name] ?? 0) + qty;
			loot.add(mon.kill(qty, {}));
		}

		let resultStr = `${user}, ${
			user.minionName
		} finished killing ${quantity}x Vasa Magus.\nVasa dropped the loot of ${objectEntries(lootOf)
			.map(l => `${l[1]}x ${l[0]}`)
			.join(', ')}`;

		if (isDoubleLootActive(this.client, duration)) {
			loot.multiply(2);
		}

		let pet = user.settings.get(UserSettings.Minion.EquippedPet);
		if (pet && kittens.includes(pet) && roll(1)) {
			await user.settings.update(UserSettings.Minion.EquippedPet, getOSItem('Magic kitten').id);
			await user.addItemsToCollectionLog({ items: new Bank().add('Magic kitten') });
			resultStr += `\n**Vasa cast a spell on you, but your ${itemNameFromID(
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
			teamSize: 1,
			loot,
			type: 'Monster',
			changeType: 'loot',
			id: VasaMagus.name,
			kc: quantity
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

		updateBankSetting(this.client, ClientSettings.EconomyStats.VasaLoot, loot);

		handleTripFinish(
			user,
			channelID,
			resultStr,
			['k', { name: 'vasa' }, true],
			image.file.buffer,
			data,
			itemsAdded
		);
	}
}
