import { reduceNumByPercent } from "e";
import { SkillsEnum } from "oldschooljs/dist/constants";
import { resolveItems } from "oldschooljs/dist/util";
import { itemNameFromID } from "../../../../lib/util";
import getOSItem from "../../../../lib/util/getOSItem";
import type { PrimaryGearSetupType, UserFullGearSetup } from "../../../../lib/gear/types";
import type { KillableMonster } from "../../../../lib/minions/types";
import type { PvMMethod } from "../../../../lib/constants";

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

interface Boost {
    description: string;
    run: (opts:  {style:PrimaryGearSetupType;duration: number; messages: string[]; gear: UserFullGearSetup;isInWilderness:boolean;monster: KillableMonster;combatMethods: PvMMethod[]} ) => boolean;
}

const boosts: Boost[] = [
    {
        description: "A boost for using a wilderness weapon for killing revenants.",
        run: ({gear,duration,messages,monster,isInWilderness,combatMethods,style}) => {
            	if (!isInWilderness || !monster.revsWeaponBoost) return;
                if (combatMethods.includes('barrage') || combatMethods.includes('burst')) return;
           
            	const specialWeapon = revSpecialWeapons[style];
                const upgradedWeapon = revUpgradedWeapons[style];

                let revBoost = 0;
                if (gear.wildy.hasEquipped(specialWeapon.name)) {
                     revBoost = 12.5;
                 } else if (gear.wildy.hasEquipped(upgradedWeapon.name)) {
                     revBoost =  17.5;
                 }
           
             if (revBoost > 0) {
              revBoost = 17.5;
              duration = reduceNumByPercent(duration, revBoost);
              messages.push(`${revBoost}% boost for ${gear.wildy.equippedWeapon()?.name}`);
             }
        }
    }
]


	function applyDragonBoost() {
		const hasDragonLance = isInWilderness
			? wildyGear.hasEquipped('Dragon hunter lance')
			: user.hasEquippedOrInBank('Dragon hunter lance');
		const hasDragonCrossbow = isInWilderness
			? wildyGear.hasEquipped('Dragon hunter crossbow')
			: user.hasEquippedOrInBank('Dragon hunter crossbow');

		if (
			(hasDragonLance && !attackStyles.includes(SkillsEnum.Ranged) && !attackStyles.includes(SkillsEnum.Magic)) ||
			(hasDragonCrossbow && attackStyles.includes(SkillsEnum.Ranged))
		) {
			dragonBoost = 15; // Common boost percentage for dragon-related gear
			dragonBoostMsg = hasDragonLance
				? `${dragonBoost}% for Dragon hunter lance`
				: `${dragonBoost}% for Dragon hunter crossbow`;
			timeToFinish = reduceNumByPercent(timeToFinish, dragonBoost);
		}
	}

	function applyBlackMaskBoost() {
		const hasBlackMask = isInWilderness
			? wildyGear.hasEquipped('Black mask')
			: user.hasEquippedOrInBank('Black mask');
		const hasBlackMaskI = isInWilderness
			? wildyGear.hasEquipped('Black mask (i)')
			: user.hasEquippedOrInBank('Black mask (i)');

		if (attackStyles.includes(SkillsEnum.Ranged) || attackStyles.includes(SkillsEnum.Magic)) {
			if (hasBlackMaskI) {
				blackMaskBoost = oneSixthBoost;
				blackMaskBoostMsg = `${blackMaskBoost}% for Black mask (i) on non-melee task`;
			}
		} else if (hasBlackMask) {
			blackMaskBoost = oneSixthBoost;
			blackMaskBoostMsg = `${blackMaskBoost}% for Black mask on melee task`;
		}
	}

	function calculateSalveAmuletBoost() {
		let salveBoost = false;
		let salveEnhanced = false;
		const style = attackStyles[0];
		if (style === 'ranged' || style === 'magic') {
			salveBoost = isInWilderness
				? wildyGear.hasEquipped('Salve amulet(i)')
				: user.hasEquippedOrInBank('Salve amulet (i)');
			salveEnhanced = isInWilderness
				? wildyGear.hasEquipped('Salve amulet(ei)')
				: user.hasEquippedOrInBank('Salve amulet (ei)');
			if (salveBoost) {
				salveAmuletBoost = salveEnhanced ? 20 : oneSixthBoost;
				salveAmuletBoostMsg = `${salveAmuletBoost}% for Salve amulet${
					salveEnhanced ? '(ei)' : '(i)'
				} on non-melee task`;
			}
		} else {
			salveBoost = isInWilderness
				? wildyGear.hasEquipped('Salve amulet')
				: user.hasEquippedOrInBank('Salve amulet');
			salveEnhanced = isInWilderness
				? wildyGear.hasEquipped('Salve amulet (e)')
				: user.hasEquippedOrInBank('Salve amulet (e)');
			if (salveBoost) {
				salveAmuletBoost = salveEnhanced ? 20 : oneSixthBoost;
				salveAmuletBoostMsg = `${salveAmuletBoost}% for Salve amulet${
					salveEnhanced ? ' (e)' : ''
				} on melee task`;
			}
		}
	}

	function calculateVirtusBoost() {
		let virtusPiecesEquipped = 0;

		for (const item of resolveItems(['Virtus mask', 'Virtus robe top', 'Virtus robe bottom'])) {
			if (isInWilderness) {
				if (wildyGear.hasEquipped(item)) {
					virtusPiecesEquipped += blackMaskBoost !== 0 && itemNameFromID(item) === 'Virtus mask' ? 0 : 1;
				}
			} else if (user.gear.mage.hasEquipped(item)) {
				virtusPiecesEquipped += blackMaskBoost !== 0 && itemNameFromID(item) === 'Virtus mask' ? 0 : 1;
			}
		}

		virtusBoost = virtusPiecesEquipped * 2;
		virtusBoostMsg =
			virtusPiecesEquipped > 1
				? ` with ${virtusPiecesEquipped} Virtus pieces`
				: virtusPiecesEquipped === 1
					? ` with ${virtusPiecesEquipped} Virtus piece`
					: '';
	}