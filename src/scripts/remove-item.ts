import '../lib/data/itemAliases';
import '../lib/itemMods';

import { writeFileSync } from 'fs';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { GearSetupTypes } from '../lib/gear/types';

const itemIDToRemove = 830;

let FINAL_QUERY = `-- Nuke these items: https://chisel.weirdgloop.org/moid/item_id.html#${itemIDToRemove}`;

FINAL_QUERY += '\nBEGIN;\n';

FINAL_QUERY += GearSetupTypes.map(gearType =>
	Object.values(EquipmentSlot).map(
		slot =>
			`UPDATE users SET "gear.${gearType}" = jsonb_set("gear.${gearType}"::jsonb, ARRAY['${slot}'], 'null'::jsonb) WHERE "gear.${gearType}"->'${slot}'->>'item' = '${itemIDToRemove}';`
	)
)
	.flat()
	.join('\n');

const removeFromBankQuery = (column: string) => `"${column}" = "${column}"::jsonb -'${itemIDToRemove}'`;
const removeFromArrayQuery = (column: string) => `"${column}" = ARRAY_REMOVE("${column}", ${itemIDToRemove})`;

const userBankQuery = `
UPDATE users 
SET ${removeFromBankQuery('bank')},
    ${removeFromBankQuery('collectionLogBank')},
    ${removeFromBankQuery('temp_cl')},
    ${removeFromBankQuery('bank_sort_weightings')},
    ${removeFromArrayQuery('favoriteItems')},
    ${removeFromArrayQuery('favorite_alchables')},
    ${removeFromArrayQuery('favorite_food')};
`;

FINAL_QUERY += userBankQuery;

const userStatsBankQuery = `
UPDATE user_stats SET
${removeFromBankQuery('sacrificed_bank')},
${removeFromBankQuery('openable_scores')},
${removeFromBankQuery('tob_cost')},
${removeFromBankQuery('tob_loot')},
${removeFromBankQuery('shades_of_morton_cost_bank')},
${removeFromBankQuery('buy_loot_bank')},
${removeFromBankQuery('buy_cost_bank')},
${removeFromBankQuery('farming_harvest_loot_bank')},
${removeFromBankQuery('farming_plant_cost_bank')},
${removeFromBankQuery('create_cost_bank')},
${removeFromBankQuery('create_loot_bank')},
${removeFromBankQuery('items_sold_bank')};
`;

FINAL_QUERY += userStatsBankQuery;

const petQuery = `
UPDATE users
SET "minion.equippedPet" = null
WHERE "minion.equippedPet"::text::integer = ${itemIDToRemove};
`;

FINAL_QUERY += petQuery;

const clientQuery = `
UPDATE "clientStorage"
SET ${removeFromBankQuery('sold_items_bank')},
    ${removeFromBankQuery('herblore_cost_bank')},
    ${removeFromBankQuery('construction_cost_bank')},
    ${removeFromBankQuery('farming_cost_bank')},
    ${removeFromBankQuery('farming_loot_bank')},
    ${removeFromBankQuery('buy_cost_bank')},
    ${removeFromBankQuery('buy_loot_bank')},
    ${removeFromBankQuery('magic_cost_bank')},
    
    ${removeFromBankQuery('crafting_cost')},
    ${removeFromBankQuery('gnome_res_cost')},
    ${removeFromBankQuery('gnome_res_loot')},
    ${removeFromBankQuery('rogues_den_cost')},
    ${removeFromBankQuery('gauntlet_loot')},
    ${removeFromBankQuery('collecting_cost')},
    ${removeFromBankQuery('collecting_loot')},
    ${removeFromBankQuery('dropped_items')},
    ${removeFromBankQuery('economyStats.PVMCost')},
    ${removeFromBankQuery('create_cost')},
    ${removeFromBankQuery('create_loot')};
`;

FINAL_QUERY += clientQuery;

// BSO
const bsoUserBankQuery = `
UPDATE users 
SET ${removeFromBankQuery('item_contract_bank')},
    ${removeFromBankQuery('disassembled_items_bank')};
`;

FINAL_QUERY += bsoUserBankQuery;
const bsoUserStatsBankQuery = `
UPDATE user_stats
SET ${removeFromBankQuery('ic_cost_bank')},
    ${removeFromBankQuery('ic_donations_given_bank')},
    ${removeFromBankQuery('ic_donations_received_bank')},
    ${removeFromBankQuery('tame_cl_bank')},
    ${removeFromBankQuery('create_loot_bank')};
`;

FINAL_QUERY += bsoUserStatsBankQuery;

FINAL_QUERY += 'COMMIT;\n';

writeFileSync('./remove-items.sql', FINAL_QUERY);
