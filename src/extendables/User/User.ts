import { User } from 'discord.js';
import { objectEntries } from 'e';
import { Extendable, ExtendableStore, KlasaClient, SettingsFolder } from 'klasa';
import PromiseQueue from 'p-queue';

import { Events, PerkTier, userQueues } from '../../lib/constants';
import { readableStatName } from '../../lib/gear';
import { gearSetupMeetsRequirement } from '../../lib/minions/functions/gearSetupMeetsRequirement';
import { KillableMonster } from '../../lib/minions/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { PoHTable } from '../../lib/typeorm/PoHTable.entity';
import { Skills } from '../../lib/types';
import { itemNameFromID, toTitleCase } from '../../lib/util';
import { formatItemReqs } from '../../lib/util/formatItemReqs';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	// @ts-ignore 2784
	public get rawSkills(this: User) {
		return (this.settings.get('skills') as SettingsFolder).toJSON() as Skills;
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

		if (monster.levelRequirements) {
			for (const [skillEnum, levelRequired] of Object.entries(monster.levelRequirements)) {
				if (this.skillLevel(skillEnum as SkillsEnum) < (levelRequired as number)) {
					return [
						false,
						`You need level ${levelRequired} ${toTitleCase(skillEnum)} to kill ${
							monster.name
						}. Check https://www.oldschool.gg/oldschoolbot/minions?${toTitleCase(
							skillEnum
						)} for information on how to train this skill.`
					];
				}
			}
		}

		if (monster.minimumGearRequirements) {
			for (const [setup, requirements] of objectEntries(monster.minimumGearRequirements)) {
				if (setup && requirements) {
					const [meetsRequirements, unmetKey, has] = gearSetupMeetsRequirement(
						this.setupStats(setup),
						requirements
					);
					if (!meetsRequirements) {
						return [
							false,
							`You don't have the requirements to kill ${
								monster.name
							}! Your ${readableStatName(
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

	public async queueFn(this: User, fn: (...args: any[]) => Promise<any>) {
		const queue = this.getUpdateQueue();
		await queue.add(fn);
	}

	// @ts-ignore 2784
	public get perkTier(this: User): PerkTier {
		return getUsersPerkTier(this);
	}

	public async getPOH(this: User) {
		const poh = await PoHTable.findOne({ userID: this.id });
		if (poh !== undefined) return poh;
		await PoHTable.insert({ userID: this.id });
		const created = await PoHTable.findOne({ userID: this.id });
		if (!created) {
			throw new Error('Failed to find POH after creation.');
		}
		return created;
	}
}
