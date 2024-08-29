import { calcWhatPercent } from "e";
import { Monsters } from "oldschooljs";
import type { PvMMethod } from "../../../../lib/constants";
import type { UserFullGearSetup } from "../../../../lib/gear/types";
import type { CombatOptionsEnum } from "../../../../lib/minions/data/combatConstants";
import { revenantMonsters } from "../../../../lib/minions/data/killableMonsters/revs";
import { type AttackStyles, convertAttackStylesToSetup, resolveAttackStyles } from "../../../../lib/minions/functions";
import type { KillableMonster } from "../../../../lib/minions/types";
import { type CurrentSlayerInfo, determineCombatBoosts } from "../../../../lib/slayer/slayerUtil";
import { maxOffenceStats } from "../../../../lib/structures/Gear";

export interface MinionKillOptions {
	attackStyles: AttackStyles[];
	gear: UserFullGearSetup;
	currentSlayerTask: CurrentSlayerInfo;
	monster: KillableMonster;
	isTryingToUseWildy: boolean;
	combatOptions: CombatOptionsEnum[];
	inputPVMMethod: PvMMethod;
	monsterKC: number;
}

type NewMinionKillReturn = string | {

};
function newMinionKillCommand({ monsterKC,combatOptions,attackStyles, gear, currentSlayerTask, monster,isTryingToUseWildy,inputPVMMethod }: MinionKillOptions): NewMinionKillReturn {
	const messages: string[] = [];
	const relevantGearSetup = convertAttackStylesToSetup(attackStyles);
	const relevantGearStat = ({ melee: 'attack_crush', mage: 'attack_magic', range: 'attack_ranged' } as const)[relevantGearSetup];

	const isOnTask =
		currentSlayerTask.assignedTask !== null &&
		currentSlayerTask.currentTask !== null &&
		currentSlayerTask.assignedTask.monsters.includes(monster.id);

	if (monster.slayerOnly && !isOnTask) {
		return `You can't kill ${monster.name}, because you're not on a slayer task.`;
	}

	if (monster.canBePked && !isTryingToUseWildy) {
		return `You can't kill ${monster.name} outside the wilderness.`;
	}

	const isInWilderness = isTryingToUseWildy || (isOnTask && currentSlayerTask.assignedTask?.wilderness) || monster.canBePked;

	if (!monster.wildy && isInWilderness) {
		return `You can't kill ${monster.name} in the wilderness.`;
	}


	const wildyGearStat = gear.wildy.getStats()[relevantGearStat];
	const revGearPercent = Math.max(0, calcWhatPercent(wildyGearStat, maxOffenceStats[relevantGearStat]));

	const matchedRevenantMonster = revenantMonsters.find(m => m.id === monster.id);
	if (matchedRevenantMonster) {
		const weapon = gear.wildy.equippedWeapon();
		if (!weapon) {
			return 'You have no weapon equipped in your Wildy outfit.';
		}

		if (weapon.equipment![relevantGearStat] < 10) {
			return `Your weapon is terrible, you can't kill Revenants. You should have ${relevantGearSetup} gear equipped in your wildy outfit, as this is what you're currently training. You can change this using \`/minion train\``;
		}
	}

	const isKillingJelly = monster.id === Monsters.Jelly.id;
	const isAbleToBurstInWilderness = isKillingJelly && isInWilderness;


	const combatMethods = determineCombatBoosts({
		cbOpts: combatOptions,
		monster,
		methods: [inputPVMMethod],
		isOnTask,
		wildyBurst: isAbleToBurstInWilderness
	});

	const resolveAttackStyleResult = resolveAttackStyles({
		monsterID: monster.id,
		boostMethod: combatMethods,
		attackStyles 
	});
	attackStyles = resolveAttackStyleResult.attackStyles;


	/**
	 * Speed/ Boosts
	 */

}
