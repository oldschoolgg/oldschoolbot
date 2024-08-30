import { Monsters } from "oldschooljs";
import { wildyKillableMonsters } from "../../../../lib/minions/data/killableMonsters/bosses/wildy";
import { revenantMonsters } from "../../../../lib/minions/data/killableMonsters/revs";
import type { KillableMonster } from "../../../../lib/minions/types";
import type { PvMMethod } from "../../../../lib/constants";
import { cannonBanks } from "../../../../lib/minions/data/combatConstants";
import type { GearBank } from "../../../../lib/structures/GearBank";

export function determineIfUsingCannon({ gearBank,monster, isOnTask, combatMethods,isInWilderness }: {gearBank:GearBank;isInWilderness:boolean; monster: KillableMonster; isOnTask: boolean; combatMethods: PvMMethod[] }) {
    
	const hasCannon = cannonBanks.some(i => gearBank.bank.has(i));
	if (combatMethods.includes('cannon') && !hasCannon) {
		return {
            usingCannon: false,
            cannonMulti: false
        };
	}
    
    let usingCannon = false;
	let cannonMulti = false;

	if (isInWilderness && combatMethods.includes('cannon')) {
		if (monster.id === Monsters.HillGiant.id || monster.id === Monsters.MossGiant.id) {
			usingCannon = isInWilderness;
		}

		if (monster.id === Monsters.Spider.id || monster.id === Monsters.Scorpion.id) {
			usingCannon = isInWilderness;
			cannonMulti = isInWilderness;
		}

		if (monster.wildySlayerCave) {
			usingCannon = isInWilderness;
			cannonMulti = isInWilderness;
			if (monster.id === Monsters.AbyssalDemon.id && !isOnTask) {
				usingCannon = false;
				cannonMulti = false;
			}
		}

		// wildy bosses
		for (const wildyMonster of wildyKillableMonsters) {
			if (monster.id === wildyMonster.id) {
				usingCannon = false;
				cannonMulti = false;
				break;
			}
		}

		// revenants
		for (const revenant of revenantMonsters) {
			if (monster.id === revenant.id) {
				usingCannon = false;
				cannonMulti = false;
				break;
			}
		}
	}

    return {
        usingCannon,
        cannonMulti
    }
}