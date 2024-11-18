import { Monsters } from 'oldschooljs';
import type { PvMMethod } from '../../../../lib/constants';
import { cannonBanks } from '../../../../lib/minions/data/combatConstants';
import { wildyKillableMonsters } from '../../../../lib/minions/data/killableMonsters/bosses/wildy';
import { revenantMonsters } from '../../../../lib/minions/data/killableMonsters/revs';
import type { KillableMonster } from '../../../../lib/minions/types';
import type { GearBank } from '../../../../lib/structures/GearBank';

const monstersCantBeCannoned = [...wildyKillableMonsters, ...revenantMonsters].map(m => m.id);

export function determineIfUsingCannon({
	gearBank,
	monster,
	isOnTask,
	combatMethods,
	isInWilderness
}: {
	gearBank: GearBank;
	isInWilderness: boolean;
	monster: KillableMonster;
	isOnTask: boolean;
	combatMethods: PvMMethod[];
}) {
	if (!combatMethods.includes('cannon')) {
		return {
			usingCannon: false,
			cannonMulti: false
		};
	}
	const hasCannon = cannonBanks.some(i => gearBank.bank.has(i));
	if (combatMethods.includes('cannon') && !hasCannon) {
		return "You don't have a cannon in your bank.";
	}

	let usingCannon = monster.canCannon;
	let cannonMulti = monster.cannonMulti;

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

		if (monstersCantBeCannoned.includes(monster.id)) {
			return {
				usingCannon: false,
				cannonMulti: false
			};
		}
	}

	return {
		usingCannon,
		cannonMulti
	};
}
