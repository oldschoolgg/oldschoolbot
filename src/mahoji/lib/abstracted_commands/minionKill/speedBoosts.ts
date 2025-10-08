import { calcWhatPercent, sumArr } from '@oldschoolgg/toolkit';
import { Bank, type Item, Items, type Monster, MonsterAttribute, Monsters } from 'oldschooljs';
import type { OffenceGearStat } from 'oldschooljs/gear';

import type { PvMMethod } from '@/lib/constants.js';
import { degradeableItems, degradeablePvmBoostItems } from '@/lib/degradeableItems.js';
import type { PrimaryGearSetupType } from '@/lib/gear/types.js';
import {
	boostCannon,
	boostCannonMulti,
	boostIceBarrage,
	boostIceBurst,
	cannonMultiConsumables,
	cannonSingleConsumables,
	iceBarrageConsumables,
	iceBurstConsumables,
	SlayerActivityConstants
} from '@/lib/minions/data/combatConstants.js';
import { revenantMonsters } from '@/lib/minions/data/killableMonsters/revs.js';
import type { AttackStyles } from '@/lib/minions/functions/index.js';
import type { Consumable } from '@/lib/minions/types.js';
import { calcPOHBoosts } from '@/lib/poh/index.js';
import { ChargeBank } from '@/lib/structures/Bank.js';
import { maxOffenceStats } from '@/lib/structures/Gear.js';
import type { MonsterActivityTaskOptions } from '@/lib/types/minions.js';
import { determineIfUsingCannon } from '@/mahoji/lib/abstracted_commands/minionKill/determineIfUsingCannon.js';
import {
	calculateVirtusBoost,
	dragonHunterWeapons
} from '@/mahoji/lib/abstracted_commands/minionKill/minionKillData.js';
import type { MinionKillOptions } from '@/mahoji/lib/abstracted_commands/minionKill/newMinionKill.js';
import type { PostBoostEffect } from '@/mahoji/lib/abstracted_commands/minionKill/postBoostEffects.js';
import { staticEquippedItemBoosts } from '@/mahoji/lib/abstracted_commands/minionKill/staticEquippedItemBoosts.js';
import { resolveAvailableItemBoosts } from '@/mahoji/mahojiSettings.js';

const revSpecialWeapons = {
	melee: Items.getOrThrow("Viggora's chainmace"),
	range: Items.getOrThrow("Craw's bow"),
	mage: Items.getOrThrow("Thammaron's sceptre")
} as const;

const revUpgradedWeapons = {
	melee: Items.getOrThrow('Ursine chainmace'),
	range: Items.getOrThrow('Webweaver bow'),
	mage: Items.getOrThrow('Accursed sceptre')
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
				message: `${boostCannon}% for Cannon in singles`,
				changes: {
					usingCannon: true
				}
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

		if (combatMethods.includes('chinning') && attackStyles.includes('ranged') && monster?.canChinning) {
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
				qtyPerMinute: attackStyles.includes('defence') ? 24 : 33
			};
			if (attackStyles.includes('defence')) {
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

		if (hasBlackMaskI && ['magic', 'ranged'].every(s => style.includes(s))) {
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
			const canBarrageMonster = monster.canBarrage || (monster.id === Monsters.Jelly.id && isInWilderness);

			if (!canBarrageMonster || (!isBarraging && !isBursting)) return null;

			let newAttackStyles = [...attackStyles];
			if (!newAttackStyles.includes('magic')) {
				newAttackStyles = ['magic'];
				if (attackStyles.includes('defence')) {
					newAttackStyles.push('defence');
				}
			}

			const { virtusBoost } = calculateVirtusBoost({ isInWilderness, gearBank, isOnTask });
			if (isBarraging && attackStyles.includes('magic')) {
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

			if (isBursting && attackStyles.includes('magic')) {
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
							item: Items.getOrThrow(equippedInThisSet.itemID),
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
								osjsMonster: osjsMon,
								totalHP: (osjsMon?.data.hitpoints ?? monster.customMonsterHP ?? 100) * quantity,
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
						message: `${equippedInThisSet.boostPercent}% for ${Items.itemNameFromId(equippedInThisSet.itemID)}`
					});
					continue;
				}
				const insteadHasDegradeableItem = monster.degradeableItemUsage?.some(
					deg =>
						deg.gearSetup === boostSet.gearSetup &&
						deg.items.some(g => gearBank.gear[boostSet.gearSetup].hasEquipped(g.itemID))
				);
				if (!equippedInThisSet && boostSet.required && !insteadHasDegradeableItem) {
					return `You need to have one of these items equipped in your ${boostSet.gearSetup} setup: ${boostSet.items.map(i => Items.itemNameFromId(i.itemID)).join(', ')}.`;
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
