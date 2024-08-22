import '../lib/safeglobals';

import { writeFileSync } from 'node:fs';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { GearSetupTypes } from '../lib/gear/types';

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

const itemsToRemove =
	'2678,2679,2680,2681,2682,2683,2684,2685,2686,2687,2688,2689,2690,2691,2692,2693,2694,2695,2696,2697,2698,2699,2700,2701,2702,2703,2704,2705,2706,2707,2708,2709,2710,2711,2712,2713,2716,2719,2723,2725,2727,2729,2731,2733,2735,2737,2739,2741,2743,2745,2747,2773,2774,2776,2778,2780,2782,2783,2785,2786,2788,2790,2792,2793,2794,2796,2797,2799,2803,2805,2807,2809,2811,2813,2815,2817,2819,2821,2823,2825,2827,2829,2831,2833,2835,2837,2839,2841,2843,2845,2847,2848,2849,2851,2853,2855,2856,2857,2858,3490,3491,3492,3493,3494,3495,3496,3497,3498,3499,3500,3501,3502,3503,3504,3505,3506,3507,3508,3509,3510,3512,3513,3514,3515,3516,3518,3520,3522,3524,3525,3526,3528,3530,3532,3534,3536,3538,3540,3542,3544,3546,3548,3550,3552,3554,3556,3558,3560,3562,3564,3566,3568,3570,3572,3573,3574,3575,3579,3580,3582,3584,3586,3588,3590,3592,3594,3596,3598,3599,3601,3602,3604,3605,3607,3609,3610,3611,3612,3613,3614,3615,3616,3617,3618,7236,7238,7239,7241,7243,7245,7247,7248,7249,7250,7251,7252,7253,7254,7255,7256,7258,7260,7262,7264,7266,7268,7270,7272,7274,7276,7278,7280,7282,7284,7286,7288,7290,7292,7294,7296,7298,7300,7301,7303,7304,7305,7307,7309,7311,7313,7315,7317,10180,10182,10184,10186,10188,10190,10192,10194,10196,10198,10202,10204,10206,10208,10210,10212,10214,10216,10218,10220,10222,10224,10226,10228,10230,10232,10234,10236,10238,10240,10242,10244,10246,10248,10250,10254,10256,10258,10260,10262,10264,10266,10268,10270,10272,10274,10276,10278,11164,12021,12023,12025,12027,12029,12031,12033,12035,12037,12039,12041,12043,12045,12047,12049,12051,12053,12055,12057,12059,12061,12063,12065,12067,12069,12071,12074,12075,12076,12077,12078,12079,12080,12081,12082,12083,12085,12086,12087,12088,12089,12090,12091,12092,12093,12094,12095,12096,12097,12098,12099,12100,12101,12102,12103,12104,12105,12106,12107,12108,12109,12110,12111,12113,12127,12130,12132,12133,12134,12135,12136,12137,12138,12140,12141,12142,12143,12144,12145,12146,12147,12148,12149,12150,12151,12152,12153,12154,12155,12156,12157,12158,12159,12162,12164,12166,12167,12168,12169,12170,12172,12173,12174,12175,12176,12177,12178,12179,12181,12182,12183,12184,12185,12186,12187,12188,12189,12190,12191,12192,12542,12544,12546,12548,12550,12552,12554,12556,12558,12560,12562,12564,12566,12568,12570,12572,12574,12576,12578,12581,12584,12587,12590,19734,19736,19738,19740,19742,19744,19746,19748,19750,19752,19754,19756,19758,19760,19762,19764,19766,19768,19770,19772,19774,19776,19778,19780,19782,19783,19784,19785,19786,19787,19788,19789,19790,19791,19792,19793,19794,19795,19796,19797,19798,19799,19800,19801,19802,19803,19804,19805,19806,19807,19808,19809,19810,19811,19813,19814,19816,19817,19818,19819,19820,19821,19822,19823,19824,19825,19826,19828,19829,19830,19831,19833,19840,19842,19844,19846,19848,19850,19852,19853,19854,19856,19857,19860,19862,19864,19866,19868,19870,19872,19874,19876,19878,19880,19882,19884,19886,19888,19890,19892,19894,19896,19898,19900,19902,19904,19906,19908,19910,21524,21525,21526,21527,22000,22001,23045,23046,23131,23133,23135,23136,23137,23144,23145,23146,23147,23148,23149,23150,23151,23152,23153,23154,23161,23162,23163,23164,23165,23166,23167,23168,23169,23170,23172,23770,23814,23815,23816,23817,24253,24493,25498,25499,25783,25784,25786,25787,25788,25789,25790,25791,26566,26944';
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

// BSO
const bsoUserBankQuery = `
UPDATE users
SET ${removeFromBankQuery('item_contract_bank')},
    ${removeFromBankQuery('disassembled_items_bank')};
`;

const currentIcQuery = `
UPDATE users
SET current_item_contract = null
WHERE current_item_contract::text::integer = ANY(${intArrayToRemove});
`;

FINAL_QUERY += currentIcQuery;

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
