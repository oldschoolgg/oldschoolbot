import { User } from 'discord.js';
import { objectEntries } from 'e';
import { Extendable, ExtendableStore, KlasaClient, KlasaUser, SettingsFolder } from 'klasa';
import { Item } from 'oldschooljs/dist/meta/types';
import PromiseQueue from 'p-queue';

import { Events, PerkTier, userQueues } from '../../lib/constants';
import { readableStatName } from '../../lib/gear';
import { KillableMonster } from '../../lib/minions/types';
import { prisma } from '../../lib/settings/prisma';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { Skills } from '../../lib/types';
import { formatItemReqs, itemNameFromID } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	// @ts-ignore 2784
	public get rawSkills(this: User) {
		return (this.settings.get('skills') as SettingsFolder).toJSON() as Skills;
	}

	// @ts-ignore 2784
	public get bitfield(this: User) {
		return this.settings.get(UserSettings.BitField);
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
						return [false, `You need these items to kill ${monster.name}: ${itemsRequiredStr}`];
					}
				} else if (!this.hasItemEquippedOrInBank(item)) {
					return [
						false,
						`You need ${itemsRequiredStr} to kill ${monster.name}. You're missing ${itemNameFromID(item)}.`
					];
				}
			}
		}

		if (monster.levelRequirements) {
			const [hasReqs, str] = this.hasSkillReqs(monster.levelRequirements);
			if (!hasReqs) {
				return [false, `You don't meet the skill requirements to kill ${monster.name}, you need: ${str}.`];
			}
		}

		if (monster.minimumGearRequirements) {
			for (const [setup, requirements] of objectEntries(monster.minimumGearRequirements)) {
				const gear = this.getGear(setup);
				if (setup && requirements) {
					const [meetsRequirements, unmetKey, has] = gear.meetsStatRequirements(requirements);
					if (!meetsRequirements) {
						return [
							false,
							`You don't have the requirements to kill ${monster.name}! Your ${readableStatName(
								unmetKey!
							)} stat in your ${setup} setup is ${has}, but you need atleast ${
								monster.minimumGearRequirements[setup]![unmetKey!]
							}.`
						];
					}
				}
			}
		}

		return [true];
	}

	// @ts-ignore 2784
	get sanitizedName(this: User) {
		return `(${this.username.replace(/[()]/g, '')})[${this.id}]`;
	}

	public log(this: User, stringLog: string) {
		this.client.emit(Events.Log, `${this.sanitizedName} ${stringLog}`);
	}

	// @ts-ignore 2784
	public get badges(this: User) {
		const username = this.settings.get(UserSettings.RSN);
		if (!username) return '';
		return (this.client as KlasaClient)._badgeCache.get(username.toLowerCase()) || '';
	}

	// @ts-ignore 2784
	public getUpdateQueue(this: User) {
		let currentQueue = userQueues.get(this.id);
		if (!currentQueue) {
			let queue = new PromiseQueue({ concurrency: 1 });
			userQueues.set(this.id, queue);
			return queue;
		}
		return currentQueue;
	}

	public async queueFn(this: User, fn: (user: KlasaUser) => Promise<void>) {
		const queue = this.getUpdateQueue();
		return queue.add(() => fn(this));
	}

	// @ts-ignore 2784
	public get perkTier(this: User): PerkTier {
		return getUsersPerkTier(this);
	}

	public async getPOH(this: User) {
		const poh = await prisma.playerOwnedHouse.findFirst({ where: { user_id: this.id } });
		if (poh !== null) return poh;
		const createdPoh = await prisma.playerOwnedHouse.create({ data: { user_id: this.id } });
		return createdPoh;
	}

	public getUserFavAlchs(this: User): Item[] {
		return this.settings
			.get(UserSettings.FavoriteAlchables)
			.filter(id => this.bank().has(id))
			.map(getOSItem)
			.filter(i => i.highalch > 0 && i.tradeable)
			.sort((a, b) => b.highalch - a.highalch);
	}
}
