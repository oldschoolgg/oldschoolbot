import '../lib/safeglobals';

import { writeFileSync } from 'node:fs';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';
import { GearSetupTypes } from '../src/lib/gear/types';

/* PSQL Function that needs to be created */
const extraFunctions = `
CREATE OR REPLACE FUNCTION array_remove_multiple(original_array anyarray, values_to_remove anyarray)
RETURNS anyarray AS $$
BEGIN
    RETURN ARRAY(
        SELECT elem
        FROM unnest(original_array) elem
        WHERE elem NOT IN (SELECT unnest(values_to_remove))
    );
END;
$$ LANGUAGE plpgsql;`;

const itemsToRemove = '2678,2679,2680';
const itemIDsToRemove = itemsToRemove.split(',');
const arrayToRemove = `ARRAY[${itemIDsToRemove.map(i => `'${i}'`).join(',')}]`;
const intArrayToRemove = `ARRAY[${itemIDsToRemove.join(',')}]`;

let FINAL_QUERY = `-- Nuke these items: https://chisel.weirdgloop.org/moid/item_id.html#${itemsToRemove}`;
FINAL_QUERY += `\n${extraFunctions}\n\n`;

FINAL_QUERY += '\nBEGIN;\n';

FINAL_QUERY += GearSetupTypes.flatMap(gearType =>
	Object.values(EquipmentSlot).map(
		slot =>
			`UPDATE users SET "gear.${gearType}" = jsonb_set("gear.${gearType}"::jsonb, ARRAY['${slot}'], 'null'::jsonb) WHERE "gear.${gearType}"->'${slot}'->>'item' = ANY(${arrayToRemove});`
	)
).join('\n');

const removeFromBankQuery = (column: string) => `"${column}" = "${column}"::jsonb - ${arrayToRemove}`;
const removeFromArrayQuery = (column: string) =>
	`"${column}" = array_remove_multiple("${column}", ${intArrayToRemove})`;

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
WHERE "minion.equippedPet"::text::integer = ANY(${intArrayToRemove});
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

FINAL_QUERY += 'COMMIT;\n';

writeFileSync('./remove-items.sql', FINAL_QUERY);
