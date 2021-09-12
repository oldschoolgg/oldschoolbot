import { objectEntries, randArrItem, randInt } from 'e';
import { Task } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';
import Monster from 'oldschooljs/dist/structures/Monster';

import { isDoubleLootActive } from '../../../lib/doubleLoot';
import { bossKillables } from '../../../lib/minions/data/killableMonsters/bosses';
import AbyssalDragon from '../../../lib/minions/data/killableMonsters/custom/AbyssalDragon';
import SeaKraken from '../../../lib/minions/data/killableMonsters/custom/SeaKraken';
import Treebeard from '../../../lib/minions/data/killableMonsters/custom/Treebeard';
import { VasaMagus, VasaMagusLootTable } from '../../../lib/minions/data/killableMonsters/custom/VasaMagus';
import { addMonsterXP } from '../../../lib/minions/functions';
import announceLoot from '../../../lib/minions/functions/announceLoot';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { NewBossOptions } from '../../../lib/types/minions';
import { updateBankSetting } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
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
	AbyssalDragon,
	Treebeard,
	SeaKraken,
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

		const xpRes = await addMonsterXP(user, {
			monsterID: VasaMagus.id,
			quantity,
			duration,
			isOnTask: false,
			taskQuantity: null
		});
		const { previousCL, itemsAdded } = await user.addItemsToBank(loot, true);

		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				itemsAdded,
				`Loot From ${quantity} ${VasaMagus.name}:`,
				true,
				{ showNewCL: 1 },
				user,
				previousCL
			);

		resultStr += `\n${xpRes}\n`;

		announceLoot({
			user,
			monsterID: VasaMagus.id,
			loot,
			notifyDrops: resolveItems(['Magus scroll', 'Voidling', 'Tattered robes of Vasa'])
		});

		updateBankSetting(this.client, ClientSettings.EconomyStats.VasaLoot, loot);

		handleTripFinish(
			this.client,
			user,
			channelID,
			resultStr,
			res => {
				user.log('continued vasa');
				return this.client.commands.get('vasa')!.run(res, [quantity]);
			},
			image!,
			data,
			itemsAdded
		);
	}
}
