import { Bank } from "oldschooljs";
import { newMinionKillCommand } from "../mahoji/lib/abstracted_commands/minionKill/newMinionKill";
import killableMonsters from "./minions/data/killableMonsters";
import { Gear } from "./structures/Gear";
import { GearBank } from "./structures/GearBank";
import { method } from "lodash";
import { getPOH } from "../mahoji/lib/abstracted_commands/pohCommand";
import { getUsersCurrentSlayerInfo } from "./slayer/slayerUtil";
import { calcMaxTripLength } from "./util/calcMaxTripLength";

for (const monster of killableMonsters) {
    const monsterKC = 10000;
    const gearBank = new GearBank({gear: {
        mage: new Gear(),
        melee: new Gear(),
        range: new Gear(),
        misc: new Gear(),
        skilling: new Gear(),
wildy: new Gear(),
fashion: new Gear(),
other: new Gear(),},
bank: new Bank(),
skillsAsLevels: {} as any})

    	const result = newMinionKillCommand({
		gearBank: user.gearBank,
		attackStyles: user.getAttackStyles(),
		currentSlayerTask: await getUsersCurrentSlayerInfo(user.id),
		monster,
		isTryingToUseWildy: wilderness ?? false,
		monsterKC: await user.getKC(monster.id),
		inputPVMMethod: method,
		maxTripLength: calcMaxTripLength(user, 'MonsterKilling'),
		pkEvasionExperience: stats.pk_evasion_exp,
		poh: await getPOH(user.id),
		inputQuantity,
		combatOptions: user.combatOptions,
		slayerUnlocks: user.user.slayer_unlocks,
		favoriteFood: user.user.favorite_food,
		bitfield: user.bitfield
	});
}