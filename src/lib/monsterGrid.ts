// import { Bank } from "oldschooljs";
// import { newMinionKillCommand } from "../mahoji/lib/abstracted_commands/minionKill/newMinionKill";
// import killableMonsters from "./minions/data/killableMonsters";
// import { Gear } from "./structures/Gear";
// import { GearBank } from "./structures/GearBank";
// import { PVM_METHODS } from "./constants";
// import { attackStylesArr } from "./minions/functions";
// import { Time } from "e";
// import type { PlayerOwnedHouse } from "@prisma/client";

// const results = [];

// for (const monster of killableMonsters) {
//     const monsterKC = 10000;
//     const gearBank = new GearBank({gear: {
//         mage: new Gear(),
//         melee: new Gear(),
//         range: new Gear(),
//         misc: new Gear(),
//         skilling: new Gear(),
// wildy: new Gear(),
// fashion: new Gear(),
// other: new Gear(),},
// bank: new Bank(),
// skillsAsLevels: {} as any})

// const pkEvasionExperience = 100000000;
// const currentSlayerTask = {
//     currentTask: {
//         id: 1,
//         created_at: new Date(),
//         quantity: 10000,
//         quantity_remaining: 10000,
//         slayer_master_id: 1,
//         monster_id: monster.id,
//         skipped: false,
//     },
//     assignedTask: {} as any,
//     slayerMaster:{} as any
// }

//     for (const isTryingToUseWildy of [true, false]) {
//         for (const inputPVMMethod of PVM_METHODS) {
//             for (const attackStyle of attackStylesArr) {
//                  const result = newMinionKillCommand({
//                     	gearBank,
//                     	attackStyles:[attackStyle],
//                     	currentSlayerTask:currentSlayerTask as any,
//                     	monster,
//                     	isTryingToUseWildy,
//                     	monsterKC,
//                     	inputPVMMethod,
//                     	maxTripLength: Time.Hour,
//                     	pkEvasionExperience,
//                     	poh: {} as PlayerOwnedHouse,
//                     	inputQuantity: undefined,
//                     	combatOptions: [],
//                     	slayerUnlocks: [],
//                     	favoriteFood: [],
//                     	bitfield: [],
//                     });
//                     results.push(result);
//             }
//         }
// 	}
