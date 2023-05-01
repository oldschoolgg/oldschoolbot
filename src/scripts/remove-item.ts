import '../lib/data/itemAliases';
import '../lib/itemMods';

import { writeFileSync } from 'fs';

import { allTrophyItems } from '../lib/data/trophies';
import { GearSetupTypes } from '../lib/gear/types';
import { itemNameFromID } from '../lib/util';

const items = allTrophyItems;

let FINAL_QUERY = `-- Nuke these items: ${items
	.map(itemNameFromID)
	.join(', ')} https://chisel.weirdgloop.org/moid/item_id.html#${items.join(',')}`;

FINAL_QUERY += '\nBEGIN;\n';

const gearQuery = `
WITH updated_gear AS (
    SELECT 
        user_id,
        jsonb_set(gear, '{item}', 'null'::jsonb) AS updated_gear
    FROM
        (SELECT 
            user_id,
            jsonb_array_elements(gear) AS gear
         FROM
            (SELECT 
                user_id,
                jsonb_each_text(ARRAY[${GearSetupTypes.map(gearType => `"gear.${gearType}"`).join(', ')}]) AS gear
             FROM
                users) AS json_gear
         WHERE
            (gear->>'item')::integer = ANY(ARRAY[${items.join(', ')}])) AS json_item)
UPDATE users
SET
    ${GearSetupTypes.map(
		gearType =>
			`"gear.${gearType}" = CASE WHEN updated_gear.user_id = users.user_id THEN updated_gear.updated_gear ELSE "gear.${gearType}" END`
	).join(',\n    ')}
FROM updated_gear;
`;

FINAL_QUERY += gearQuery;

const itemNumbersString = items.map(number => `'${number}'`).join('-');

const userBankQuery = `
UPDATE users 
SET "bank" = "bank"::jsonb -${itemNumbersString},
    "collectionLogBank" = "collectionLogBank"::jsonb -${itemNumbersString},
    "temp_cl" = "temp_cl"::jsonb -${itemNumbersString};
`;

FINAL_QUERY += userBankQuery;

const userStatsBankQuery = `
UPDATE user_stats
SET "sacrificed_bank" = "sacrificed_bank"::jsonb -${itemNumbersString},
    "items_sold_bank" = "items_sold_bank"::jsonb -${itemNumbersString};
`;

FINAL_QUERY += userStatsBankQuery;

const petQuery = `
UPDATE users
SET "minion.equippedPet" = null
WHERE "minion.equippedPet"::text::integer = ANY(ARRAY[${items.join(', ')}]);
`;

FINAL_QUERY += petQuery;

const itemNumbersArrayString = `ARRAY[${items.join(', ')}]`;

const userItemsQuery = `
UPDATE users 
   SET "favoriteItems" = ARRAY_REMOVE("favoriteItems", ALL ${itemNumbersArrayString}),
       "favorite_alchables" = ARRAY_REMOVE("favorite_alchables", ALL ${itemNumbersArrayString}),
       "favorite_food" = ARRAY_REMOVE("favorite_food", ALL ${itemNumbersArrayString});
`;

FINAL_QUERY += userItemsQuery;

FINAL_QUERY += 'COMMIT;\n';

writeFileSync('./remove-items.sql', FINAL_QUERY);
