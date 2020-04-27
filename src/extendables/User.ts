import { Extendable, ExtendableStore } from 'klasa';
import { User } from 'discord.js';

import { UserSettings } from '../lib/settings/types/UserSettings';
import { KillableMonster } from '../lib/minions/types';
import { formatItemReqs } from '../lib/util/formatItemReqs';
import { itemNameFromID } from '../lib/util';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	public hasMonsterRequirements(this: User, monster: KillableMonster) {
		if (monster.qpRequired && this.settings.get(UserSettings.QP) < monster.qpRequired) {
			return [
				false,
				`You need ${monster.qpRequired} QP to kill ${monster.name}. You can get Quest Points through questing with \`+quest\``
			];
		}

		if (monster.itemsRequired) {
			const itemsRequiredStr = formatItemReqs(monster.itemsRequired);
			for (const item of monster.itemsRequired) {
				if (Array.isArray(item)) {
					if (!item.some(itemReq => this.hasItemEquippedOrInBank(itemReq as number))) {
						return [
							false,
							`You need these items to kill ${monster.name}: ${itemsRequiredStr}`
						];
					}
				} else if (!this.hasItemEquippedOrInBank(item)) {
					return [
						false,
						`You need ${itemsRequiredStr} to kill ${
							monster.name
						}. You're missing ${itemNameFromID(item)}.`
					];
				}
			}
		}

		return [true];
	}
}
