import { User } from 'discord.js';
import { objectEntries } from 'e';
import { Extendable, ExtendableStore } from 'klasa';

import readableStatName from '../lib/gear/functions/readableStatName';
import { gearSetupMeetsRequirement } from '../lib/minions/functions/gearSetupMeetsRequirement';
import { KillableMonster } from '../lib/minions/types';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { SkillsEnum } from '../lib/skilling/types';
import { Skills } from '../lib/types';
import { itemNameFromID, toTitleCase } from '../lib/util';
import { formatItemReqs } from '../lib/util/formatItemReqs';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore 2784
	public get rawSkills(this: User) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		return this.settings.get('skills').toJSON() as Skills;
	}

	public hasMonsterRequirements(this: User, monster: KillableMonster) {
		if (monster.qpRequired && this.settings.get(UserSettings.QP) < monster.qpRequired) {
			return [
				false,
				`You need ${monster.qpRequired} QP to kill ${monster.name}. You can get Quest Points through questing with \`=quest\``
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
}
