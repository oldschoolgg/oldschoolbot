import { SkillsEnum } from "oldschooljs/dist/constants";
import getOSItem from "../../../../lib/util/getOSItem";
import type { OffenceGearStat, PrimaryGearSetupType } from "../../../../lib/gear/types";
import type { Consumable } from "../../../../lib/minions/types";
import type { PvMMethod } from "../../../../lib/constants";
import { dragonHunterWeapons } from "./minionKillData";
import type Monster from "oldschooljs/dist/structures/Monster";
import { MonsterAttribute } from "oldschooljs/dist/meta/monsterData";
import { staticEquippedItemBoosts } from "./staticEquippedItemBoosts";
import { revenantMonsters } from "../../../../lib/minions/data/killableMonsters/revs";
import { calcWhatPercent } from "e";
import { maxOffenceStats } from "../../../../lib/structures/Gear";
import { Bank } from "oldschooljs";
import { determineIfUsingCannon } from "./determineIfUsingCannon";
import { cannonMultiConsumables, boostCannonMulti, cannonSingleConsumables, boostCannon, SlayerActivityConstants, iceBarrageConsumables, boostIceBarrage, boostIceBurst, iceBurstConsumables } from "../../../../lib/minions/data/combatConstants";
import { degradeablePvmBoostItems } from "../../../../lib/degradeableItems";
import { convertPvmStylesToGearSetup, itemNameFromID } from "../../../../lib/util";
import type { MinionKillOptions } from "./newMinionKill";

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

export type BoostResult = {
    percentageReduction: number;
    message: string;
    consumables?: Consumable[];
    changes?: Partial<{
        usingCannon:boolean,
		cannonMulti: boolean
		chinning: boolean,
		bob:boolean,
    }>
};
type BoostReturn = undefined | string | BoostResult | BoostResult[];
export type BoostArgs = MinionKillOptions & {
	isOnTask: boolean;
	osjsMon: Monster | undefined;
	primaryStyle: PrimaryGearSetupType;
	isInWilderness: boolean;
	combatMethods: PvMMethod[];
    relevantGearStat: OffenceGearStat;
}

export type Boost = {
    description: string;
    run: (opts: BoostArgs ) => BoostReturn;
}
//  const staticEquippedItemBoosts = [{
//                 item: getOSItem('Dragon hunter lance'),
//                 attackStyles: ['melee']
//             },
//         {
//             item: getOSItem('Dragon hunter crossbow'),
//             attackStyles: ['ranged']
//         }]
const oneSixthBoost = 16.67;

// needs to check if they got blackmaskboost
// const virtusBoost: Boost = {
// 					description: 'Virtus',
// 					run: ({ gearBank, isInWilderness, style, osjsMon }) => {
// 						let virtusPiecesEquipped = 0;

// 		for (const item of resolveItems(['Virtus mask', 'Virtus robe top', 'Virtus robe bottom'])) {
// 			if (isInWilderness) {
// 				if (gearBank.gear.wildy.hasEquipped(item)) {
// 					virtusPiecesEquipped += blackMaskBoost !== 0 && itemNameFromID(item) === 'Virtus mask' ? 0 : 1;
// 				}
// 			} else if (gearBank.gear.mage.hasEquipped(item)) {
// 				virtusPiecesEquipped += blackMaskBoost !== 0 && itemNameFromID(item) === 'Virtus mask' ? 0 : 1;
// 			}
// 		}

// 		virtusBoost = virtusPiecesEquipped * 2;
// 		virtusBoostMsg =
// 			virtusPiecesEquipped > 1
// 				? ` with ${virtusPiecesEquipped} Virtus pieces`
// 				: virtusPiecesEquipped === 1
// 					? ` with ${virtusPiecesEquipped} Virtus piece`
// 					: '';

//                     return {
//                         percentageReduction: virtusBoost,
//                         message: `${virtusBoost}% for Virtus${virtusBoostMsg}`
//                     }
// 					}
// 				}
const cannonBoost: Boost =  {
    description: "Cannon",
    run: ({ gearBank,monster, combatMethods,isOnTask,isInWilderness}) => {
        const cannonResult = determineIfUsingCannon({ gearBank, monster, isOnTask, combatMethods, isInWilderness });
	    if (!cannonResult.usingCannon) return;
		// combatMethods = removeFromArr(combatMethods, 'cannon');
        if ((monster?.cannonMulti) && cannonResult.cannonMulti) {
             return {
                    percentageReduction: boostCannonMulti,
                    consumables: [cannonMultiConsumables],
                    message: `${boostCannonMulti}% for Cannon in multi`
                }
            } else if ((monster?.canCannon)) {
                return {
                    percentageReduction: boostCannon,
                    consumables: [cannonSingleConsumables],
                    message: `${boostCannon}% for Cannon in singles`
                }
            }
	}
   };
const chinningBoost: Boost = {
    description: "Chinning boost",
    run: ({combatMethods,attackStyles,monster,gearBank,isOnTask,isInWilderness}) => {
        const cannonResult = determineIfUsingCannon({ gearBank, monster, isOnTask, combatMethods, isInWilderness });
	    if (cannonResult.usingCannon) return; 	
	    if (combatMethods.includes('chinning') && attackStyles.includes(SkillsEnum.Ranged) && monster?.canChinning) {
		// Check what Chinchompa to use
		const chinchompas = ['Black chinchompa', 'Red chinchompa', 'Chinchompa'];
		let chinchompa = chinchompas[0];
		for (const chin of chinchompas) {
			if (gearBank.bank.has(chin) && gearBank.bank.amount(chin) > 5000) {
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
                message: `${chinBoostLongRanged}% for ${chinchompa} Longrange`
            }
		} else {
            return {
                percentageReduction: chinBoostRapid,
                consumables: [chinningConsumables],
                message: `${chinBoostRapid}% for ${chinchompa} Rapid`
            }
		}
	}
    }
}
const salveBoost: Boost =  {
					description: 'Salve amulet boost',
					run: ({ gearBank, isInWilderness, primaryStyle: style, osjsMon }) => {
						const isUndead = osjsMon?.data?.attributes?.includes(MonsterAttribute.Undead);
						if (!isUndead) return;
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

const dragonHunterBoost: Boost =   {
        description: "A boost for dragon-hunter gear when killing dragons",
        run: ({monster,isInWilderness,osjsMon,primaryStyle: style,gearBank}) => {
            const isDragon = osjsMon?.data?.attributes?.includes(MonsterAttribute.Dragon);
            if (!isDragon || monster.name.toLowerCase() === 'vorkath') return;

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
        description: "A boost for using a wilderness weapon for killing revenants.",
        run: ({monster,isInWilderness,combatMethods,primaryStyle: style,gearBank}) => {
            const matchedRevenantMonster = revenantMonsters.find(m => m.id === monster.id);
            if (!matchedRevenantMonster) return;
            	if (!isInWilderness || !monster.revsWeaponBoost) return;
                if (combatMethods.includes('barrage') || combatMethods.includes('burst')) return;
           
            	const specialWeapon = revSpecialWeapons[style];
                const upgradedWeapon = revUpgradedWeapons[style];

                let revBoost = 0;
                if (gearBank.gear.wildy.hasEquipped(specialWeapon.name)) {
                     revBoost = 12.5;
                 } else if (gearBank.gear.wildy.hasEquipped(upgradedWeapon.name)) {
                     revBoost =  17.5;
                 }
           
             if (revBoost > 0) {
              return {
                    percentageReduction: revBoost,
                    message: `${revBoost}% boost for ${gearBank.gear.wildy.equippedWeapon()?.name}`
              }
             }
        }
    };

    const blackMaskBoost: Boost =  {
        description: "Slayer Helm/Black mask boost for being on task",
        run: ({isInWilderness,gearBank,primaryStyle: style,isOnTask}) => {
           if (!isOnTask) return;
		const hasBlackMask = gearBank.wildyGearCheck('Black mask', isInWilderness);
		const hasBlackMaskI = gearBank.wildyGearCheck('Black mask (i)', isInWilderness);
         
            if (hasBlackMaskI && [SkillsEnum.Magic,SkillsEnum.Ranged].every(s => style.includes(s))) {
                return {
                    percentageReduction: oneSixthBoost,
                    message: `${oneSixthBoost}% for Black mask (i) on non-melee task`
                }
            } else if (hasBlackMask) {
                return {
                    percentageReduction: oneSixthBoost,
                    message: `${oneSixthBoost}% for Black mask on melee task`
                }
            }
        }
    };
    // if an array, only the highest applies
export const boosts: (Boost | Boost[])[] = [
   {
        description: "Static Item Boosts",
        run: ({isInWilderness,gearBank,primaryStyle: style,combatMethods}) => {
    for (const item of staticEquippedItemBoosts) {
        const equipped = gearBank.wildyGearCheck(item.item.id, isInWilderness);
            if (!equipped) continue;
            if (style !== item.attackStyle) continue;
            if (item.anyRequiredPVMMethod.every(m => !combatMethods.includes(m))) continue;

                return {
                    percentageReduction: item.percentageBoost,
                    message: `15% boost for ${item.item.name}`
                }
            }
    }
    },
   [dragonHunterBoost,revWildyGearBoost] ,
   [salveBoost,blackMaskBoost],
   {
    description: "Revs",
    run: ({gearBank,primaryStyle: style,monster,relevantGearStat}) => {
                 const matchedRevenantMonster = revenantMonsters.find(m => m.id === monster.id);
                 if (!matchedRevenantMonster) return;

                 const wildyGearStat = gearBank.gear.wildy.getStats()[relevantGearStat];
	            const revGearPercent = Math.max(0, calcWhatPercent(wildyGearStat, maxOffenceStats[relevantGearStat]));

                 const results: BoostResult[] = [{
                    percentageReduction: revGearPercent / 4,
                    message: `${(revGearPercent / 4).toFixed(2)}% (out of a possible 25%) for ${style}`
                 }];
            
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
  [cannonBoost,chinningBoost],
  {
    description: "Barrage/Bursting",
    run: ({monster,attackStyles,combatMethods}) => {
        const isBarraging = combatMethods.includes('barrage');
        const isBursting = combatMethods.includes('burst');
        if (!isBarraging && !isBursting) return;
        	if (
		isBarraging &&
		attackStyles.includes(SkillsEnum.Magic) &&
		(monster.canBarrage)
	) {
		boosts.push(`${boostIceBarrage + virtusBoost}% for Ice Barrage${virtusBoostMsg}`);
        return {
            percentageReduction: boostIceBarrage + virtusBoost,
            consumables: [iceBarrageConsumables],
            message: `${boostIceBarrage + virtusBoost}% for Ice Barrage${virtusBoostMsg}`,
            changes: {
                bob: SlayerActivityConstants.IceBarrage
            }
        }
	}
    
    if (
		isBursting &&
		attackStyles.includes(SkillsEnum.Magic) &&
		(monster.canBarrage)
	) {
        return {
            percentageReduction: boostIceBurst + virtusBoost,
            consumables: [iceBurstConsumables],
            message: `${boostIceBurst + virtusBoost}% for Ice Burst${virtusBoostMsg}`,
            changes: {
                bob: SlayerActivityConstants.IceBurst
            }
        }
	}
	
    }
  },{
    description: "Degradeable Items",
    run: ({isInWilderness,gearBank,monster,attackStyles}) => {
        const degItemBeingUsed: BoostResult[] = [];
    	if (monster.degradeableItemUsage) {
		for (const set of monster.degradeableItemUsage) {
			const equippedInThisSet = set.items.find(item => gearBank.gear[set.gearSetup].hasEquipped(item.itemID));

			if (set.required && !equippedInThisSet) {
				return `You need one of these items equipped in your ${set.gearSetup} setup to kill ${
					monster.name
				}: ${set.items
					.map(i => i.itemID)
					.map(itemNameFromID)
					.join(', ')}.`;
			}

			if (equippedInThisSet) {
				degItemBeingUsed.push({
                    percentageReduction: equippedInThisSet.boostPercent,
                    message: `${equippedInThisSet.boostPercent}% for ${itemNameFromID(equippedInThisSet.itemID)}`
                });
			}
		}
	} else {
		for (const degItem of degradeablePvmBoostItems) {
			const isUsing = convertPvmStylesToGearSetup(attackStyles).includes(degItem.attackStyle);
			const gearCheck = isInWilderness
				? gearBank.gear.wildy.hasEquipped(degItem.item.id)
				: gearBank.gear[degItem.attackStyle].hasEquipped(degItem.item.id);

			if (isUsing && gearCheck) {
                degItemBeingUsed.push({
                    percentageReduction: degItem.boost,
                    message: `${degItem.boost}% for ${degItem.item.name}`
                });
			}
		}
	}
    }
  },
  {
    description: "Equipped item boosts",
    run: ({monster,gearBank}) => {
	if (!monster.equippedItemBoosts) return;
    const results: BoostResult[] = [];
		for (const boostSet of monster.equippedItemBoosts) {
			const equippedInThisSet = boostSet.items.find(item =>
				gearBank.gear[boostSet.gearSetup].hasEquipped(item.itemID)
			);
			if (equippedInThisSet) {
                results.push({
                    percentageReduction: equippedInThisSet.boostPercent,
                    message: `${equippedInThisSet.boostPercent}% for ${itemNameFromID(equippedInThisSet.itemID)}`
                })
			}
		}
        return results;
	}
  }
];
