import { calcWhatPercent, sumArr } from 'e';
import { Bank, type Item, type Monster } from 'oldschooljs';

import { SkillsEnum } from 'oldschooljs/dist/constants';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';
import type { PvMMethod } from '../../../../lib/constants';
import { degradeableItems, degradeablePvmBoostItems } from '../../../../lib/degradeableItems';
import type { OffenceGearStat, PrimaryGearSetupType } from '../../../../lib/gear/types';
import {
	SlayerActivityConstants,
	boostCannon,
	boostCannonMulti,
	boostIceBarrage,
	boostIceBurst,
	cannonMultiConsumables,
	cannonSingleConsumables,
	iceBarrageConsumables,
	iceBurstConsumables
} from '../../../../lib/minions/data/combatConstants';
import { revenantMonsters } from '../../../../lib/minions/data/killableMonsters/revs';
import type { AttackStyles } from '../../../../lib/minions/functions';
import type { Consumable } from '../../../../lib/minions/types';
import { calcPOHBoosts } from '../../../../lib/poh';
import { ChargeBank } from '../../../../lib/structures/Bank';
import { maxOffenceStats } from '../../../../lib/structures/Gear';
import type { MonsterActivityTaskOptions } from '../../../../lib/types/minions';
import { itemNameFromID } from '../../../../lib/util';
import getOSItem from '../../../../lib/util/getOSItem';
import { resolveAvailableItemBoosts } from '../../../mahojiSettings';
import { determineIfUsingCannon } from './determineIfUsingCannon';
import { calculateVirtusBoost, dragonHunterWeapons } from './minionKillData';
import type { MinionKillOptions } from './newMinionKill';
import type { PostBoostEffect } from './postBoostEffects';
import { staticEquippedItemBoosts } from './staticEquippedItemBoosts';

const revSpecialWeapons = {
	melee: getOSItem("Viggora's chainmace"),
	range: getOSItem("Craw's bow"),
	mage: getOSItem("Thammaron's sceptre")
} as const;

const revUpgradedWeapons = {
	melee: getOSItem('Ursine chainmace'),
	range: getOSItem('Webweaver bow'),
	mage: getOSItem('Accursed sceptre')
} as const;

export type CombatMethodOptions = Pick<
	MonsterActivityTaskOptions,
	| 'cannonMulti'
	| 'usingCannon'
	| 'chinning'
	| 'bob'
	| 'died'
	| 'pkEncounters'
	| 'pkEncounters'
	| 'hasWildySupplies'
	| 'isInWilderness'
>;

export type BoostResult = {
	percentageIncrease?: number;
	percentageReduction?: number;
	message?: string;
	consumables?: Consumable[];
	itemCost?: Bank;
	charges?: ChargeBank;
	changes?: { attackStyles?: AttackStyles[] } & CombatMethodOptions;
	confirmation?: string;
};

export type BoostReturn = null | undefined | string | BoostResult | BoostResult[];

export type BoostArgs = MinionKillOptions & {
	isOnTask: boolean;
	osjsMon: Monster | undefined;
	primaryStyle: PrimaryGearSetupType;
	isInWilderness: boolean;
	combatMethods: PvMMethod[];
	relevantGearStat: OffenceGearStat;
	currentTaskOptions: CombatMethodOptions;
	addPostBoostEffect: (effect: PostBoostEffect) => void;
	killsRemaining: number | null;
};

export type Boost = {
	description: string;
	run: (opts: BoostArgs) => BoostReturn;
};

const oneSixthBoost = 16.67;

const cannonBoost: Boost = {
	description: 'Cannon',
	run: ({ gearBank, monster, combatMethods, isOnTask, isInWilderness }) => {
		const cannonResult = determineIfUsingCannon({ gearBank, monster, isOnTask, combatMethods, isInWilderness });
		if (typeof cannonResult === 'string') return cannonResult;
		if (!cannonResult.usingCannon) return null;
		if (monster?.cannonMulti && cannonResult.cannonMulti) {
			return {
				percentageReduction: boostCannonMulti,
				consumables: [cannonMultiConsumables],
				message: `${boostCannonMulti}% for Cannon in multi`,
				changes: {
					cannonMulti: true
				}
			};
		} else if (monster?.canCannon) {
			return {
				percentageReduction: boostCannon,
				consumables: [cannonSingleConsumables],
				message: `${boostCannon}% for Cannon in singles`
			};
		}

		return null;
	}
};
const chinningBoost: Boost = {
	description: 'Chinning boost',
	run: ({ combatMethods, attackStyles, monster, gearBank, isOnTask, isInWilderness }) => {
		const cannonResult = determineIfUsingCannon({ gearBank, monster, isOnTask, combatMethods, isInWilderness });
		if (typeof cannonResult === 'string') return cannonResult;
		if (cannonResult.usingCannon) return null;

		if (combatMethods.includes('chinning') && attackStyles.includes(SkillsEnum.Ranged) && monster?.canChinning) {
			const chinchompas = ['Black chinchompa', 'Red chinchompa', 'Chinchompa'];
			let chinchompa = chinchompas[0];
			for (const chin of chinchompas) {
				if (gearBank.bank.has(chin) && gearBank.bank.amount(chin) >= 5000) {
					chinchompa = chin;
					break;
				}
			}
			const chinBoostRapid = chinchompa === 'Chinchompa' ? 73 : chinchompa === 'Red chinchompa' ? 76 : 82;
			const chinBoostLongRanged = chinchompa === 'Chinchompa' ? 63 : chinchompa === 'Red chinchompa' ? 69 : 77;
			const chinningConsumables: Consumable = {
				itemCost: new Bank().add(chinchompa, 1),
				qtyPerMinute: attackStyles.includes(SkillsEnum.Defence) ? 24 : 33
			};
			if (attackStyles.includes(SkillsEnum.Defence)) {
				return {
					percentageReduction: chinBoostLongRanged,
					consumables: [chinningConsumables],
					message: `${chinBoostLongRanged}% for ${chinchompa} Longrange`,
					changes: {
						chinning: true
					}
				};
			} else {
				return {
					percentageReduction: chinBoostRapid,
					consumables: [chinningConsumables],
					message: `${chinBoostRapid}% for ${chinchompa} Rapid`,
					changes: {
						chinning: true
					}
				};
			}
		}
	}
};
const salveBoost: Boost = {
	description: 'Salve amulet boost',
	run: ({ gearBank, isInWilderness, primaryStyle: style, osjsMon }) => {
		const isUndead = osjsMon?.data?.attributes?.includes(MonsterAttribute.Undead);
		if (!isUndead) return null;
		let salveBoost = false;
		let salveEnhanced = false;
		if (style === 'range' || style === 'mage') {
			salveBoost = gearBank.wildyGearCheck('Salve amulet (i)', isInWilderness);
			salveEnhanced = gearBank.wildyGearCheck('Salve amulet (ei)', isInWilderness);
		} else {
			salveBoost = gearBank.wildyGearCheck('Salve amulet', isInWilderness);
			salveEnhanced = gearBank.wildyGearCheck('Salve amulet (e)', isInWilderness);
		}

		if (salveBoost) {
			const percent = salveEnhanced ? 20 : oneSixthBoost;
			return {
				percentageReduction: percent,
				message: `${percent}% for Salve amulet${salveEnhanced ? ' (e)' : ''} on melee task`
			};
		}
	}
};

const dragonHunterBoost: Boost = {
	description: 'A boost for dragon-hunter gear when killing dragons',
	run: ({ monster, isInWilderness, osjsMon, primaryStyle: style, gearBank }) => {
		const isDragon = osjsMon?.data?.attributes?.includes(MonsterAttribute.Dragon);
		if (!isDragon || monster.name.toLowerCase() === 'vorkath') return null;

		for (const wep of dragonHunterWeapons) {
			const hasWep = gearBank.wildyGearCheck(wep.item.id, isInWilderness);
			if (hasWep && style === wep.attackStyle) {
				return {
					percentageReduction: wep.boost,
					message: `${wep.boost}% boost for ${wep.item.name}`
				};
			}
		}
	}
};
const revWildyGearBoost: Boost = {
	description: 'A boost for using a wilderness weapon for killing in wildy.',
	run: ({ monster, isInWilderness, combatMethods, primaryStyle: style, gearBank }) => {
		if (!isInWilderness || !monster.revsWeaponBoost) return null;
		if (combatMethods.includes('barrage') || combatMethods.includes('burst')) return null;

		const specialWeapon = revSpecialWeapons[style];
		const upgradedWeapon = revUpgradedWeapons[style];

		let revBoost = 0;
		if (gearBank.gear.wildy.hasEquipped(upgradedWeapon.name)) {
			revBoost = 17.5;
		} else if (gearBank.gear.wildy.hasEquipped(specialWeapon.name)) {
			revBoost = 12.5;
		}

		if (revBoost > 0) {
			return {
				percentageReduction: revBoost,
				message: `${revBoost}% boost for ${gearBank.gear.wildy.equippedWeapon()?.name}`
			};
		}
	}
};

const blackMaskBoost: Boost = {
	description: 'Slayer Helm/Black mask boost for being on task',
	run: ({ isInWilderness, gearBank, primaryStyle: style, isOnTask }) => {
		if (!isOnTask) return null;
		const hasBlackMask = gearBank.wildyGearCheck('Black mask', isInWilderness);
		const hasBlackMaskI = gearBank.wildyGearCheck('Black mask (i)', isInWilderness);

		if (hasBlackMaskI && [SkillsEnum.Magic, SkillsEnum.Ranged].every(s => style.includes(s))) {
			return {
				percentageReduction: oneSixthBoost,
				message: `${oneSixthBoost}% for Black mask (i) on task`
			};
		} else if (hasBlackMask) {
			return {
				percentageReduction: oneSixthBoost,
				message: `${oneSixthBoost}% for Black mask on task`
			};
		}
		return null;
	}
};

// if an array, only the highest applies
export const mainBoostEffects: (Boost | Boost[])[] = [
	{
		description: 'Item Boosts',
		run: ({ monster, gearBank, isInWilderness }) => {
			const results: BoostResult[] = [];
			for (const [item, boostAmount] of resolveAvailableItemBoosts(gearBank, monster, isInWilderness).items()) {
				results.push({
					percentageReduction: boostAmount,
					message: `${boostAmount}% for ${item.name}`
				});
			}
			return results;
		}
	},
	{
		description: 'POH Boosts',
		run: ({ poh, monster }) => {
			if (!monster.pohBoosts) return null;
			const pohBoostResult = calcPOHBoosts(poh, monster.pohBoosts);
			if (pohBoostResult.boost > 0) {
				return {
					percentageReduction: pohBoostResult.boost,
					message: pohBoostResult.messages.join(' + ')
				};
			}
		}
	},
	[dragonHunterBoost, revWildyGearBoost],
	[salveBoost, blackMaskBoost],
	{
		description: 'Revs',
		run: ({ gearBank, primaryStyle: style, monster, relevantGearStat }) => {
			const matchedRevenantMonster = revenantMonsters.find(m => m.id === monster.id);
			if (!matchedRevenantMonster) return null;

			const wildyGearStat = gearBank.gear.wildy.getStats()[relevantGearStat];
			const revGearPercent = Math.max(0, calcWhatPercent(wildyGearStat, maxOffenceStats[relevantGearStat]));

			const results: BoostResult[] = [
				{
					percentageReduction: revGearPercent / 4,
					message: `${(revGearPercent / 4).toFixed(2)}% (out of a possible 25%) for ${style}`
				}
			];

			const specialWeapon = revSpecialWeapons[style];
			if (gearBank.gear.wildy.hasEquipped(specialWeapon.name)) {
				results.push({
					percentageReduction: 35,
					message: `35% for ${specialWeapon.name}`
				});
			}
			return results;
		}
	},
	chinningBoost,
	cannonBoost,
	{
		description: 'Barrage/Bursting',
		run: ({ monster, attackStyles, combatMethods, isOnTask, isInWilderness, gearBank }) => {
			const isBarraging = combatMethods.includes('barrage');
			const isBursting = combatMethods.includes('burst');

			if (!isBarraging && !isBursting) return null;

			let newAttackStyles = [...attackStyles];
			if (!newAttackStyles.includes(SkillsEnum.Magic)) {
				newAttackStyles = [SkillsEnum.Magic];
				if (attackStyles.includes(SkillsEnum.Defence)) {
					newAttackStyles.push(SkillsEnum.Defence);
				}
			}

			const { virtusBoost } = calculateVirtusBoost({ isInWilderness, gearBank, isOnTask });
			if (isBarraging && attackStyles.includes(SkillsEnum.Magic) && monster.canBarrage) {
				return {
					percentageReduction: boostIceBarrage + virtusBoost,
					consumables: [iceBarrageConsumables],
					message: `${boostIceBarrage + virtusBoost}% for Ice Barrage`,
					changes: {
						bob: SlayerActivityConstants.IceBarrage,
						attackStyles: newAttackStyles
					}
				};
			}

			if (isBursting && attackStyles.includes(SkillsEnum.Magic) && monster.canBarrage) {
				return {
					percentageReduction: boostIceBurst + virtusBoost,
					consumables: [iceBurstConsumables],
					message: `${boostIceBurst + virtusBoost}% for Ice Burst`,
					changes: {
						bob: SlayerActivityConstants.IceBurst,
						attackStyles: newAttackStyles
					}
				};
			}
		}
	},
	{
		description: 'Degradeable Items',
		run: ({ isInWilderness, gearBank, monster, primaryStyle, osjsMon, addPostBoostEffect }) => {
			const degItemBeingUsed: { item: Item; boostPercent: number }[] = [];
			if (monster.degradeableItemUsage) {
				for (const set of monster.degradeableItemUsage) {
					const equippedInThisSet = set.items.find(item =>
						gearBank.gear[set.gearSetup].hasEquipped(item.itemID)
					);
					if (equippedInThisSet) {
						degItemBeingUsed.push({
							item: getOSItem(equippedInThisSet.itemID),
							boostPercent: equippedInThisSet.boostPercent
						});
					}
				}
			} else {
				for (const degItem of degradeablePvmBoostItems) {
					const isUsing = primaryStyle === degItem.attackStyle;
					const gearCheck = gearBank.gear[isInWilderness ? 'wildy' : degItem.attackStyle].hasEquipped(
						degItem.item.id
					);
					if (isUsing && gearCheck) {
						degItemBeingUsed.push({ item: degItem.item, boostPercent: degItem.boost });
					}
				}
			}

			if (degItemBeingUsed.length === 0) return;
			addPostBoostEffect({
				description: 'Degradeable Items',
				run: ({ quantity, duration }) => {
					const charges = new ChargeBank();
					const messages: string[] = [];
					for (const rawItem of degItemBeingUsed) {
						const degItem = degradeablePvmBoostItems.find(i => i.item.id === rawItem.item.id);
						if (!degItem) throw new Error(`Missing degradeable item for ${rawItem.item.name}`);
						const chargesNeeded = Math.ceil(
							degItem.charges({
								killableMon: monster,
								osjsMonster: osjsMon!,
								totalHP: (osjsMon?.data.hitpoints ?? 100) * quantity,
								duration
							})
						);
						const actualDegItem = degradeableItems.find(i => i.item.id === degItem.item.id);
						if (!actualDegItem) throw new Error(`Missing actual degradeable item for ${rawItem.item.name}`);
						charges.add(actualDegItem.settingsKey, chargesNeeded);
						messages.push(`${rawItem.boostPercent}% for ${rawItem.item.name}`);
					}

					return {
						charges,
						message: messages.join(', '),
						percentageReduction: sumArr(degItemBeingUsed.map(i => i.boostPercent))
					};
				}
			});

			return null;
		}
	},
	{
		description: 'Equipped item boosts',
		run: ({ monster, gearBank }) => {
			if (!monster.equippedItemBoosts) return null;
			const results: BoostResult[] = [];
			for (const boostSet of monster.equippedItemBoosts) {
				const equippedInThisSet = boostSet.items.find(item =>
					gearBank.gear[boostSet.gearSetup].hasEquipped(item.itemID)
				);
				if (equippedInThisSet) {
					results.push({
						percentageReduction: equippedInThisSet.boostPercent,
						message: `${equippedInThisSet.boostPercent}% for ${itemNameFromID(equippedInThisSet.itemID)}`
					});
					continue;
				}
				const insteadHasDegradeableItem = monster.degradeableItemUsage?.some(
					deg =>
						deg.gearSetup === boostSet.gearSetup &&
						deg.items.some(g => gearBank.gear[boostSet.gearSetup].hasEquipped(g.itemID))
				);
				if (!equippedInThisSet && boostSet.required && !insteadHasDegradeableItem) {
					return `You need to have one of these items equipped in your ${boostSet.gearSetup} setup: ${boostSet.items.map(i => itemNameFromID(i.itemID)).join(', ')}.`;
				}
			}
			return results;
		}
	},
	{
		description: 'Static Item Boosts',
		run: ({ isInWilderness, gearBank, primaryStyle: style, combatMethods }) => {
			for (const item of staticEquippedItemBoosts) {
				const equipped = gearBank.wildyGearCheck(item.item.id, isInWilderness);
				if (!equipped) continue;
				if (style !== item.attackStyle) continue;
				if (item.anyRequiredPVMMethod.every(m => !combatMethods.includes(m))) continue;

				return {
					percentageReduction: item.percentageBoost,
					message: `15% boost for ${item.item.name}`
				};
			}
			return null;
		}
	}
];
