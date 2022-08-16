import { User } from 'discord.js';
import { increaseNumByPercent, notEmpty, objectValues, Time, uniqueArr } from 'e';
import { Extendable, ExtendableStore, KlasaClient, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import Monster from 'oldschooljs/dist/structures/Monster';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import {
	Emoji,
	Events,
	GLOBAL_BSO_XP_MULTIPLIER,
	MAX_QP,
	MAX_TOTAL_LEVEL,
	MAX_XP,
	skillEmoji
} from '../../lib/constants';
import { gorajanArcherOutfit, gorajanOccultOutfit, gorajanWarriorOutfit } from '../../lib/data/CollectionsExport';
import { getSimilarItems } from '../../lib/data/similarItems';
import { onMax } from '../../lib/events';
import { hasGracefulEquipped } from '../../lib/gear';
import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { AttackStyles } from '../../lib/minions/functions';
import { AddXpParams, KillableMonster } from '../../lib/minions/types';
import { prisma } from '../../lib/settings/prisma';
import { getMinigameScore, MinigameName, Minigames } from '../../lib/settings/settings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skillcapes from '../../lib/skilling/skillcapes';
import Skills from '../../lib/skilling/skills';
import Creatures from '../../lib/skilling/skills/hunter/creatures';
import { Creature, SkillsEnum } from '../../lib/skilling/types';
import { Skills as TSkills } from '../../lib/types';
import {
	addItemToBank,
	convertLVLtoXP,
	convertXPtoLVL,
	formatSkillRequirements,
	itemNameFromID,
	skillsMeetRequirements,
	stringMatches,
	toKMB,
	toTitleCase
} from '../../lib/util';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import getOSItem from '../../lib/util/getOSItem';
import { minionIsBusy } from '../../lib/util/minionIsBusy';
import { minionStatus } from '../../lib/util/minionStatus';
import { getKC, minionName, skillLevel } from '../../lib/util/minionUtils';
import resolveItems from '../../lib/util/resolveItems';
import { activity_type_enum } from '.prisma/client';

const suffixes = new SimpleTable<string>()
	.add('🎉', 200)
	.add('🎆', 10)
	.add('🙌', 10)
	.add('🎇', 10)
	.add('🥳', 10)
	.add('🍻', 10)
	.add('🎊', 10)
	.add(Emoji.PeepoNoob, 1)
	.add(Emoji.PeepoRanger, 1)
	.add(Emoji.PeepoSlayer);

function levelUpSuffix() {
	return suffixes.roll().item;
}

interface StaticXPBoost {
	item: Item;
	boostPercent: number;
	skill: SkillsEnum;
}
const staticXPBoosts = new Map<SkillsEnum, StaticXPBoost[]>().set(SkillsEnum.Firemaking, [
	{
		item: getOSItem('Flame gloves'),
		boostPercent: 2.5,
		skill: SkillsEnum.Firemaking
	},
	{
		item: getOSItem('Ring of fire'),
		boostPercent: 2.5,
		skill: SkillsEnum.Firemaking
	}
]);

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	// @ts-ignore 2784
	public get minionStatus(this: User) {
		return minionStatus(this);
	}

	getKC(this: KlasaUser, id: number) {
		return getKC(this, id);
	}

	public async getKCByName(this: KlasaUser, kcName: string) {
		const mon = effectiveMonsters.find(
			mon => stringMatches(mon.name, kcName) || mon.aliases.some(alias => stringMatches(alias, kcName))
		);
		if (mon) {
			return [mon.name, this.getKC((mon as unknown as Monster).id)];
		}

		const minigame = Minigames.find(
			game => stringMatches(game.name, kcName) || game.aliases.some(alias => stringMatches(alias, kcName))
		);
		if (minigame) {
			return [minigame.name, await this.getMinigameScore(minigame.column)];
		}

		const creature = Creatures.find(c => c.aliases.some(alias => stringMatches(alias, kcName)));
		if (creature) {
			return [creature.name, this.getCreatureScore(creature)];
		}

		const special = [
			[['superior', 'superiors', 'superior slayer monster'], UserSettings.Slayer.SuperiorCount],
			[['tithefarm', 'tithe'], UserSettings.Stats.TitheFarmsCompleted]
		].find(s => s[0].includes(kcName));
		if (special) {
			return [special[0][0], await this.settings.get(special![1] as string)];
		}

		return [null, 0];
	}

	getCreatureScore(this: KlasaUser, creature: Creature) {
		return this.settings.get(UserSettings.CreatureScores)[creature.id] ?? 0;
	}

	// @ts-ignore 2784
	public get hasMinion(this: User) {
		return this.settings.get(UserSettings.Minion.HasBought);
	}

	// @ts-ignore 2784
	public maxTripLength(this: User, activity?: activity_type_enum) {
		return calcMaxTripLength(this, activity);
	}

	// @ts-ignore 2784
	public get minionIsBusy(this: User): boolean {
		return minionIsBusy(this.id);
	}

	public hasGracefulEquipped(this: User) {
		const rawGear = this.rawGear();
		for (const i of Object.values(rawGear)) {
			if (hasGracefulEquipped(i)) return true;
		}
		return false;
	}

	// @ts-ignore 2784
	public get minionName(this: User): string {
		return minionName(this);
	}

	public async addXP(this: User, params: AddXpParams): Promise<string> {
		await this.settings.sync(true);
		const currentXP = this.settings.get(`skills.${params.skillName}`) as number;
		const currentLevel = this.skillLevel(params.skillName);
		const multiplier = params.multiplier !== false;

		const name = toTitleCase(params.skillName);

		const skill = Object.values(Skills).find(skill => skill.id === params.skillName)!;
		const currentTotalLevel = this.totalLevel();

		if (multiplier) {
			params.amount *= GLOBAL_BSO_XP_MULTIPLIER;
		}

		const rawGear = this.rawGear();
		const allCapes = objectValues(rawGear)
			.map(val => val.cape)
			.filter(notEmpty)
			.map(i => i.item);

		// Build list of all Master capes including combined capes.
		const allMasterCapes = Skillcapes.map(i => i.masterCape)
			.map(msc => getSimilarItems(msc.id))
			.flat(Infinity) as number[];

		// Get cape object from MasterSkillCapes that matches active skill.
		const matchingCape =
			multiplier || params.masterCapeBoost
				? Skillcapes.find(cape => params.skillName === cape.skill)?.masterCape
				: undefined;

		// If the matching cape [or similar] is equipped, isMatchingCape = matched itemId.
		const isMatchingCape =
			(multiplier || params.masterCapeBoost) && matchingCape
				? allCapes.find(cape => getSimilarItems(matchingCape.id).includes(cape))
				: false;

		// Get the masterCape itemId for use in text output, and check for non-matching cape.
		const masterCape = isMatchingCape
			? isMatchingCape
			: multiplier || params.masterCapeBoost === true
			? allMasterCapes.find(cape => allCapes.includes(cape))
			: undefined;

		if (masterCape) {
			params.amount = increaseNumByPercent(params.amount, isMatchingCape ? 8 : 3);
		}
		// Check if each gorajan set is equipped:
		const wildyOutfit = this.getGear('wildy');
		const gorajanMeleeEquipped =
			this.getGear('melee').hasEquipped(gorajanWarriorOutfit, true) ||
			wildyOutfit.hasEquipped(gorajanWarriorOutfit, true);
		const gorajanRangeEquipped =
			this.getGear('range').hasEquipped(gorajanArcherOutfit, true) ||
			wildyOutfit.hasEquipped(gorajanArcherOutfit, true);
		const gorajanMageEquipped =
			this.getGear('mage').hasEquipped(gorajanOccultOutfit, true) ||
			wildyOutfit.hasEquipped(gorajanOccultOutfit, true);

		// Determine if boost should apply based on skill + equipped sets:
		let gorajanBoost = false;
		const gorajanMeleeBoost =
			multiplier &&
			[SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence].includes(params.skillName) &&
			gorajanMeleeEquipped;
		const gorajanRangeBoost = multiplier && params.skillName === SkillsEnum.Ranged && gorajanRangeEquipped;
		const gorajanMageBoost = multiplier && params.skillName === SkillsEnum.Magic && gorajanMageEquipped;
		// 2x HP if all 3 gorajan sets are equipped:
		const gorajanHpBoost =
			multiplier &&
			params.skillName === SkillsEnum.Hitpoints &&
			gorajanMeleeEquipped &&
			gorajanRangeEquipped &&
			gorajanMageEquipped;

		if (gorajanMeleeBoost || gorajanRangeBoost || gorajanMageBoost || gorajanHpBoost) {
			params.amount *= 2;
			gorajanBoost = true;
		}

		let firstAgeEquipped = 0;
		for (const item of resolveItems([
			'First age tiara',
			'First age amulet',
			'First age cape',
			'First age bracelet',
			'First age ring'
		])) {
			if (this.hasItemEquippedAnywhere(item)) {
				firstAgeEquipped += 1;
			}
		}

		if (firstAgeEquipped > 0) {
			if (firstAgeEquipped === 5) {
				params.amount = increaseNumByPercent(params.amount, 6);
			} else {
				params.amount = increaseNumByPercent(params.amount, firstAgeEquipped);
			}
		}

		const boosts = staticXPBoosts.get(params.skillName);
		if (boosts && !params.artificial) {
			for (const booster of boosts) {
				if (this.hasItemEquippedAnywhere(booster.item.id)) {
					params.amount = increaseNumByPercent(params.amount, booster.boostPercent);
				}
			}
		}

		params.amount = Math.floor(params.amount);

		const newXP = Math.min(MAX_XP, currentXP + params.amount);
		const newLevel = convertXPtoLVL(newXP, 120);
		const totalXPAdded = newXP - currentXP;

		// Pre-MAX_XP
		let preMax = -1;
		if (totalXPAdded > 0) {
			preMax = totalXPAdded;
			await prisma.xPGain.create({
				data: {
					user_id: BigInt(this.id),
					skill: params.skillName,
					xp: Math.floor(totalXPAdded),
					artificial: params.artificial ? true : null
				}
			});
		}

		// Post-MAX_XP
		if (params.amount - totalXPAdded > 0) {
			await prisma.xPGain.create({
				data: {
					user_id: BigInt(this.id),
					skill: params.skillName,
					xp: Math.floor(params.amount - totalXPAdded),
					artificial: params.artificial ? true : null,
					post_max: true
				}
			});
		}

		// Ignore notifications if the user is already MAX_XP
		if (preMax !== -1) {
			// If they reached a XP milestone, send a server notification.
			// 500m and 5b are handled below
			for (const XPMilestone of [
				50_000_000, 100_000_000, 150_000_000, 200_000_000, 1_000_000_000, 2_000_000_000, 3_000_000_000,
				4_000_000_000
			]) {
				if (newXP < XPMilestone) break;

				if (currentXP < XPMilestone && newXP >= XPMilestone) {
					this.client.emit(
						Events.ServerNotification,
						`${skill.emoji} **${this.username}'s** minion, ${
							this.minionName
						}, just achieved ${newXP.toLocaleString()} XP in ${toTitleCase(params.skillName)}!`
					);
					break;
				}
			}

			// Announcements with nthUser
			for (const { type, value } of [
				{ type: 'lvl', value: 120 },
				{ type: 'xp', value: 500_000_000 },
				{ type: 'xp', value: 5_000_000_000 }
			]) {
				// Ignore check
				if (type === 'lvl') {
					if (newLevel < value || currentLevel >= value || newLevel < value) continue;
				} else if (newXP < value || currentXP >= value || newXP < value) continue;

				const skillNameCased = toTitleCase(params.skillName);

				let resultStr = '';
				let queryValue = 0;

				// Prepare the message to be sent
				if (type === 'lvl') {
					queryValue = convertLVLtoXP(value);
					resultStr += `${skill.emoji} **${this.username}'s** minion, ${
						this.minionName
					}, just achieved level ${value} in ${skillNameCased}! They are the {nthUser} to get level ${value} in ${skillNameCased}.${
						!this.isIronman ? '' : ` They are the {nthIron} to get level ${value} in ${skillNameCased}`
					}`;
				} else {
					queryValue = value;
					resultStr += `${skill.emoji} **${this.username}'s** minion, ${
						this.minionName
					}, just achieved ${toKMB(value)} XP in ${skillNameCased}! They are the {nthUser} to get ${toKMB(
						value
					)} in ${skillNameCased}.${
						!this.isIronman ? '' : ` They are the {nthIron} to get ${toKMB(value)} XP in ${skillNameCased}`
					}`;
				}

				// Query nthUser and nthIronman
				const [nthUser] = await prisma.$queryRawUnsafe<
					{
						count: string;
					}[]
				>(`SELECT COUNT(*) FROM users WHERE "skills.${params.skillName}" >= ${queryValue};`);
				resultStr = resultStr.replace('{nthUser}', formatOrdinal(Number(nthUser.count) + 1));
				if (this.isIronman) {
					const [nthIron] = await prisma.$queryRawUnsafe<
						{
							count: string;
						}[]
					>(
						`SELECT COUNT(*) FROM users WHERE "minion.ironman" = true AND "skills.${params.skillName}" >= ${queryValue};`
					);
					resultStr = resultStr.replace('{nthIron}', formatOrdinal(Number(nthIron.count) + 1));
				}

				this.client.emit(Events.ServerNotification, resultStr);
			}

			await this.settings.update(`skills.${params.skillName}`, Math.floor(newXP));
		}

		if (currentXP >= MAX_XP) {
			let xpStr = '';
			if (params.duration && !params.minimal) {
				xpStr += `You received no XP because you have ${toKMB(MAX_XP)} ${name} XP already.`;
				xpStr += ` Tracked ${params.amount.toLocaleString()} ${skill.emoji} XP.`;
				let rawXPHr = (params.amount / (params.duration / Time.Minute)) * 60;
				rawXPHr = Math.floor(rawXPHr / 1000) * 1000;
				xpStr += ` (${toKMB(rawXPHr)}/Hr)`;
			} else {
				xpStr += `:no_entry_sign: Tracked ${params.amount.toLocaleString()} ${skill.emoji} XP.`;
			}
			return xpStr;
		}
		let str = '';
		if (preMax !== -1) {
			str = params.minimal
				? `+${Math.ceil(params.amount).toLocaleString()} ${skillEmoji[params.skillName]}`
				: `You received ${Math.ceil(params.amount).toLocaleString()} ${skillEmoji[params.skillName]} XP`;

			if (masterCape && !params.minimal) {
				if (isMatchingCape) {
					str += ` You received 8% bonus XP for having a ${itemNameFromID(masterCape)}.`;
				} else {
					str += ` You received 3% bonus XP for having a ${itemNameFromID(masterCape)}.`;
				}
			}

			if (gorajanBoost && !params.minimal) {
				str += ' (2x boost from Gorajan armor)';
			}

			if (firstAgeEquipped && !params.minimal) {
				str += ` You received ${
					firstAgeEquipped === 5 ? 6 : firstAgeEquipped
				}% bonus XP for First age outfit items.`;
			}

			if (params.duration && !params.minimal) {
				let rawXPHr = (params.amount / (params.duration / Time.Minute)) * 60;
				rawXPHr = Math.floor(rawXPHr / 1000) * 1000;
				str += ` (${toKMB(rawXPHr)}/Hr)`;
			}

			if (currentTotalLevel < MAX_TOTAL_LEVEL && this.totalLevel() >= MAX_TOTAL_LEVEL) {
				str += '\n\n**Congratulations, your minion has reached the maximum total level!**\n\n';
				onMax(this);
			} else if (currentLevel !== newLevel) {
				str += params.minimal
					? `(Levelled up to ${newLevel})`
					: `\n**Congratulations! Your ${name} level is now ${newLevel}** ${levelUpSuffix()}`;
			}
		}
		return str;
	}

	public skillLevel(this: User, skillName: SkillsEnum) {
		return skillLevel(this, skillName);
	}

	public totalLevel(this: User, returnXP = false) {
		const userXPs = Object.values(this.rawSkills) as number[];
		let totalLevel = 0;
		for (const xp of userXPs) {
			totalLevel += returnXP ? xp : convertXPtoLVL(xp, 120);
		}
		return totalLevel;
	}

	// @ts-ignore 2784
	get isBusy(this: User) {
		const client = this.client as KlasaClient;
		return client.oneCommandAtATimeCache.has(this.id) || client.secondaryUserBusyCache.has(this.id);
	}

	/**
	 * Toggle whether this user is busy or not, this adds another layer of locking the user
	 * from economy actions.
	 *
	 * @param busy boolean Whether the new toggled state will be busy or not busy.
	 */
	public toggleBusy(this: User, busy: boolean) {
		const client = this.client as KlasaClient;

		if (busy) {
			client.secondaryUserBusyCache.add(this.id);
		} else {
			client.secondaryUserBusyCache.delete(this.id);
		}
	}

	public async addQP(this: User, amount: number) {
		await this.settings.sync(true);
		const currentQP = this.settings.get(UserSettings.QP);
		const newQP = Math.min(MAX_QP, currentQP + amount);

		if (currentQP < MAX_QP && newQP === MAX_QP) {
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.QuestIcon} **${this.username}'s** minion, ${this.minionName}, just achieved the maximum amount of Quest Points!`
			);
		}
		return this.settings.update(UserSettings.QP, newQP);
	}

	// @ts-ignore 2784
	public get isIronman(this: User) {
		return this.settings.get(UserSettings.Minion.Ironman);
	}

	public async incrementMonsterScore(this: User, monsterID: number, amountToAdd = 1) {
		await this.settings.sync(true);
		const currentMonsterScores = this.settings.get(UserSettings.MonsterScores);

		return this.settings.update(
			UserSettings.MonsterScores,
			addItemToBank(currentMonsterScores, monsterID, amountToAdd)
		);
	}

	public async incrementCreatureScore(this: User, creatureID: number, amountToAdd = 1) {
		await this.settings.sync(true);
		const currentCreatureScores = this.settings.get(UserSettings.CreatureScores);

		return this.settings.update(
			UserSettings.CreatureScores,
			addItemToBank(currentCreatureScores, creatureID, amountToAdd)
		);
	}

	public async setAttackStyle(this: User, newStyles: AttackStyles[]) {
		await this.settings.update(UserSettings.AttackStyle, uniqueArr(newStyles), {
			arrayAction: 'overwrite'
		});
	}

	public getAttackStyles(this: User) {
		const styles = this.settings.get(UserSettings.AttackStyle);
		if (styles.length === 0) {
			return [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence];
		}
		return styles;
	}

	public resolveAvailableItemBoosts(this: User, monster: KillableMonster) {
		const boosts = new Bank();
		if (monster.itemInBankBoosts) {
			for (const boostSet of monster.itemInBankBoosts) {
				let highestBoostAmount = 0;
				let highestBoostItem = 0;

				// find the highest boost that the player has
				for (const [itemID, boostAmount] of Object.entries(boostSet)) {
					const parsedId = parseInt(itemID);
					if (!this.hasItemEquippedOrInBank(parsedId)) continue;
					if (boostAmount > highestBoostAmount) {
						highestBoostAmount = boostAmount;
						highestBoostItem = parsedId;
					}
				}

				if (highestBoostAmount && highestBoostItem) {
					boosts.add(highestBoostItem, highestBoostAmount);
				}
			}
		}
		return boosts.bank;
	}

	public hasSkillReqs(this: User, reqs: TSkills): [boolean, string | null] {
		const hasReqs = skillsMeetRequirements(this.rawSkills, reqs);
		if (!hasReqs) {
			return [false, formatSkillRequirements(reqs)];
		}
		return [true, null];
	}

	// @ts-ignore 2784
	public get combatLevel(this: User): number {
		const defence = this.skillLevel(SkillsEnum.Defence);
		const ranged = this.skillLevel(SkillsEnum.Ranged);
		const hitpoints = this.skillLevel(SkillsEnum.Hitpoints);
		const magic = this.skillLevel(SkillsEnum.Magic);
		const prayer = this.skillLevel(SkillsEnum.Prayer);
		const attack = this.skillLevel(SkillsEnum.Attack);
		const strength = this.skillLevel(SkillsEnum.Strength);

		const base = 0.25 * (defence + hitpoints + Math.floor(prayer / 2));
		const melee = 0.325 * (attack + strength);
		const range = 0.325 * (Math.floor(ranged / 2) + ranged);
		const mage = 0.325 * (Math.floor(magic / 2) + magic);
		return Math.floor(base + Math.max(melee, range, mage));
	}

	getMinigameScore(this: User, id: MinigameName): Promise<number> {
		return getMinigameScore(this.id, id);
	}
}
