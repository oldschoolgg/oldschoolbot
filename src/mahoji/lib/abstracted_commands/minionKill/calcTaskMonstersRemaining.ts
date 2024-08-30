import { Monsters } from "oldschooljs";
import type { CurrentSlayerInfo } from "../../../../lib/slayer/slayerUtil";
import { SlayerTaskUnlocksEnum } from "../../../../lib/slayer/slayerUnlocks";
import type { KillableMonster } from "../../../../lib/minions/types";

export function changeQuantityForTaskKillsRemaining({isOnTask,quantity,monster,task,slayerUnlocks}: {slayerUnlocks:SlayerTaskUnlocksEnum[];isOnTask: boolean; task: CurrentSlayerInfo; monster: KillableMonster; quantity: number; }) {
	if (!isOnTask || !task.currentTask) return quantity;
	let effectiveQtyRemaining = task.currentTask.quantity_remaining;
	if (
		monster.id === Monsters.KrilTsutsaroth.id &&
		task.currentTask?.monster_id !== Monsters.KrilTsutsaroth.id
	) {
		effectiveQtyRemaining = Math.ceil(effectiveQtyRemaining / 2);
	} else if (monster.id === Monsters.Kreearra.id && task.currentTask?.monster_id !== Monsters.Kreearra.id) {
		effectiveQtyRemaining = Math.ceil(effectiveQtyRemaining / 4);
	} else if (
		monster.id === Monsters.GrotesqueGuardians.id &&
		slayerUnlocks.includes(SlayerTaskUnlocksEnum.DoubleTrouble)
	) {
		effectiveQtyRemaining = Math.ceil(effectiveQtyRemaining / 2);
	}
	return Math.min(quantity, effectiveQtyRemaining);
}