import { mentionCommand } from '@oldschoolgg/toolkit/discord-util';
import { formatDuration, stringMatches } from '@oldschoolgg/toolkit/util';
import type { ChatInputCommandInteraction } from 'discord.js';
import { Bank, type Item, Items, itemID } from 'oldschooljs';

import { ValeTotemsBuyables, ValeTotemsSellables } from '@/lib/data/buyables/valeTotemsBuyables.js';
import { QuestID } from '@/lib/minions/data/quests.js';
import type { ValeTotemsActivityTaskOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import { handleMahojiConfirmation } from '@/lib/util/handleMahojiConfirmation.js';
import { userHasGracefulEquipped, userStatsBankUpdate, userStatsUpdate } from '@/mahoji/mahojiSettings.js';


interface TotemDecoration {
    log: Item;
    logAmount: number;
    item: Item;
    level: number;
    xpPerLap: number;
    offerings: number;
    stringing: boolean;
}

export async function valeTotemsStartCommand(
    user: MUser,
    channelID: string,
    itemToFletch: string | undefined,
    staminaPot?: boolean | undefined
) {
    if (user.minionIsBusy) {
        return `${user.usernameOrMention} is busy`;
    }

    if (!user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun)) {
        return `${user.minionName} needs to complete the "Children of the Sun" quest before ${user.minionName} can start Vale Totems minigame. Send ${user.minionName} to do the quest using: ${mentionCommand(
            globalClient,
            'activities',
            'quest'
        )}.`;
    }

    const fletchingLvl = user.skillLevel('fletching');
    if (fletchingLvl < 20) {
        return 'You need 20 Fletching to start Vale Totems minigame.';
    }

    // TODO: Allow already prepared decorations
    if (!itemToFletch) {
        return `You have to select an item to fletch during Vale Totems.`;
    }

    const fletchableItem = Items.get(itemToFletch);
    if (!fletchableItem) return 'Invalid fletchable item';

    const decoration = ValeTotemsDecorations.find(i => i.item.id === fletchableItem.id);
    if (!decoration) return `Internal error: ${itemToFletch} not found`;
    
    const userBank = user.bank;
    const logType = decoration.log;
    const logCostLap = decoration.logAmount;
    const logsOwned = userBank.amount(logType)
    
    if (logsOwned < decoration.logAmount) {
        return `You don't own: ${logCostLap} ${logType.name}.`;
    }

    if (fletchingLvl < decoration.level) {
        return `You need ${decoration.level} Fletching to fletch ${decoration.item.name}.`;
    }
    
    // '@oldschoolgg/toolkit/datetime' | 1 second = 1000 ms
    const AVG_TIME_PER_LAP = 258000;
    const NO_SHORTCUT_PENALTY = 10000;
    const NO_GRACEFUL_PENALTY = 30000;
    const NO_LOG_BASKET_PENALTY = 10000;
    const NO_BANK_SHORTCUT_PENALTY = 10000;
    const SHIELD_FLETCH_PENALTY = 30000;
    const STRING_NO_SPOOL_PENALTY = 15000;
    const FLETCHING_KNIFE_PENALTY = 15000;
    const NO_STAMINA_POT_PENALTY = 40000;

    const STRINGS_PER_LAP = 32;
    const DEFAULT_LOG_COST_PER_LAP = 40;
    const BANK_SHORTCUT_AGILITY_LVL = 25;
    const LOG_SHORTCUTS_AGILITY_LVL = 45;
    const NO_STAMINA_POTION_AGILITY_LVL = 70;

    const messages: string[] = [];

    let timePerLap = AVG_TIME_PER_LAP;
 
    let stringItem;

    if (decoration.stringing) {
        stringItem = Items.get('Bow string');
	    if (!stringItem) return 'Internal error: Bow string is invalid item';

        if (userBank.amount(stringItem.id) < STRINGS_PER_LAP) return `You need at least 32 Bow strings to fletch ${decoration.item.name}!`;
        if (!user.hasEquippedOrInBank(itemID('Bow string spool'))) {
            timePerLap += STRING_NO_SPOOL_PENALTY;
        } else {
            messages.push(`-${formatDuration(STRING_NO_SPOOL_PENALTY)} for Bow string spool`);
        }
    }

    const maxTripLength = calcMaxTripLength(user, 'ValeTotems');

    if (!userHasGracefulEquipped(user)) {
        timePerLap += NO_GRACEFUL_PENALTY;
    } else {
        messages.push(`-${formatDuration(NO_GRACEFUL_PENALTY)} for having Graceful equipped`);
    }

    if (!user.hasEquippedOrInBank(itemID('Fletching knife'))) {
        timePerLap += FLETCHING_KNIFE_PENALTY;
    } else {
        messages.push(`-${formatDuration(FLETCHING_KNIFE_PENALTY)} for Fletching knife`);
    }

    const agilityLevel = user.skillLevel('agility');

    if (!user.hasEquippedOrInBank(itemID('Log basket')) || !user.hasEquippedOrInBank(itemID('Forestry basket'))) {
        timePerLap += NO_LOG_BASKET_PENALTY;
        if (agilityLevel < BANK_SHORTCUT_AGILITY_LVL) { // Bank shortcut
            timePerLap += NO_BANK_SHORTCUT_PENALTY;
        } else {
            messages.push(`-${formatDuration(NO_BANK_SHORTCUT_PENALTY)} for bank shortcut`);
        }
    } else {
        messages.push(`-${formatDuration(NO_BANK_SHORTCUT_PENALTY)} for Log basket`);
    }

    if (agilityLevel < LOG_SHORTCUTS_AGILITY_LVL) { // Shortcuts
        timePerLap += NO_SHORTCUT_PENALTY;
    } else {
        messages.push(`-${formatDuration(NO_BANK_SHORTCUT_PENALTY)} for other shortcuts`);
    }

    if (agilityLevel < NO_STAMINA_POTION_AGILITY_LVL) {
        if (!staminaPot) timePerLap += NO_STAMINA_POT_PENALTY;
    } else {
        messages.push(`-${formatDuration(NO_STAMINA_POT_PENALTY)} for agility level 70`);
    }

    if (logCostLap > DEFAULT_LOG_COST_PER_LAP) {
        timePerLap += SHIELD_FLETCH_PENALTY;
        messages.push(`+${formatDuration(NO_BANK_SHORTCUT_PENALTY)} for shield fletching`);
    }

    const limits = [
        Math.floor(logsOwned / logCostLap),
        Math.floor(maxTripLength / timePerLap) * logCostLap
    ];
    
    if (stringItem) {
        limits.push(Math.floor(userBank.amount(stringItem.id) / STRINGS_PER_LAP));
    }

    const laps = Math.min(...limits);
    const duration = laps * timePerLap;
    const logCost = laps * logCostLap;
    const fletchingXp = laps * decoration.xpPerLap;
    
    // Offering boost for "stepping on the ent trails"
    const boost = Math.min(
        (await user.fetchMinigameScore('vale_totems')) / 100,
        10
    );

    if (boost > 0) {
        messages.push(`+${boost}% to offerings for minion learning`);
    }

    const totalOfferings = Math.floor(laps * decoration.offerings * (1 + boost));

    const cost = new Bank();
    cost.add(logType.id, logCost);
    if (decoration.stringing) {
        const stringCost = STRINGS_PER_LAP * laps;
        cost.add(stringItem!.id, stringCost);
    }
    if (staminaPot) {
        // add stamina pot to cost
    }

    await user.removeItemsFromBank(cost);
    await userStatsBankUpdate(user, 'vale_totems_cost_bank', cost);

    await addSubTaskToActivityTask<ValeTotemsActivityTaskOptions>({
        type: 'ValeTotems',
        offerings: totalOfferings,
        fletchXp: fletchingXp,
        userID: user.id,
        duration: duration,
        channelID: channelID.toString(),
        minigameID: 'vale_totems',
        quantity: laps,
        logID: logType.name,
        itemID: fletchableItem.name
    });
    // TODO:
    // Add Bow string spool bonus (+5-10min to fletching bows)
    let str = `${user.minionName} is off to do ${laps} laps of Vale Totems using ${cost} - the total trip will take ${
        formatDuration(duration)
    }, with each lap taking ${formatDuration(timePerLap)}.`;

    if (messages.length > 0) {
        str += `\n\n**Per lap:** ${messages.join(', ')}.`;
    }

    return str;
}

// xpPerLap (carving + decorating + fletching) * 8
const groups = [
    {
        log: 'Oak logs',
        items: [
            ['Oak shortbow (u)', 20, 2576, false],
            ['Oak shortbow', 20, 3104, true],
            ['Oak longbow (u)', 25, 2848, false],
            ['Oak longbow', 25, 3648, true],
            ['Oak shield', 27, 3648, false, 72],
            ['Oak stock', 24, 2560, false],
        ],
        offerings: 160
    },
    {
        log: 'Willow logs',
        items: [
            ['Willow shortbow (u)', 35, 6105.6, false],
            ['Willow shortbow', 35, 7168, true],
            ['Willow longbow (u)', 40, 6368, false],
            ['Willow longbow', 40, 7696, true],
            ['Willow shield', 42, 7696, false, 72],
            ['Willow stock', 39, 5744, false],
        ],
        offerings: 240
    },
    {
        log: 'Maple logs',
        items: [
            ['Maple shortbow (u)', 50, 9664, false],
            ['Maple shortbow', 50, 11264, true],
            ['Maple longbow (u)', 55, 9929.6, false],
            ['Maple longbow', 55, 11792, true],
            ['Maple shield', 57, 11792, false, 72],
            ['Maple stock', 54, 9088, false],
        ],
        offerings: 320
    },
    {
        log: 'Yew logs',
        items: [
            ['Yew shortbow (u)', 65, 15216, false],
            ['Yew shortbow', 65, 17376, true],
            ['Yew longbow (u)', 70, 15456, false],
            ['Yew longbow', 70, 17856, true],
            ['Yew shield', 72, 17856, false, 72],
            ['Yew stock', 69, 14656, false],
        ],
        offerings: 520
    },
    {
        log: 'Magic logs',
        items: [
            ['Magic shortbow (u)', 80, 27497.6, false],
            ['Magic shortbow', 80, 30163.2, true],
            ['Magic longbow (u)', 85, 27760, false],
            ['Magic longbow', 85, 30688, true],
            ['Magic shield', 87, 30688, false, 72],
            ['Magic stock', 78, 27072, false],
        ],
        offerings: 720
    },
    {
        log: 'Redwood logs',
        items: [
            ['Redwood hiking staff', 90, 30640, false],
            ['Redwood shield', 92, 37216, false, 72],
        ],
        offerings: 840
    }
];
// Per lap basis
export const ValeTotemsDecorations: TotemDecoration[] = groups.flatMap(({ log, items, offerings }) => 
    items.map(([itemName, level, xp, stringing, amount = 40]) => ({
        log: Items.getOrThrow(log as string),
        logAmount: amount as number,
        item: Items.getOrThrow(itemName as string),
        level: level as number,
        xpPerLap: xp as number,
        offerings: offerings as number,
        stringing: stringing as boolean
    }))
);

export async function valeTotemsBuyCommand(
    interaction: ChatInputCommandInteraction,
    user: MUser,
    item: string | undefined,
    quantity = 1
) {
    if (!user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun)) {
        return `${user.minionName} needs to complete the "Children of the Sun" quest before ${user.minionName} can access Vale Research Exchange. Send ${user.minionName} to do the quest using: ${mentionCommand(
            globalClient,
            'activities',
            'quest'
        )}.`;
    }

    const { vale_research_points: currentResearchPoints } = await user.fetchStats({ vale_research_points: true });
    if (!item) {
        return `You currently have ${currentResearchPoints.toLocaleString()} Vale Research points.`;
    }

    const shopItem = ValeTotemsBuyables.find(
        i => stringMatches(item, i.name) || i.aliases?.some(alias => stringMatches(alias, item))
    );
    if (!shopItem) {
        return `This is not a valid item to buy. These are the items that can be bought using Vale Research points: ${ValeTotemsBuyables
            .map(v => v.name)
            .join(', ')}`;
    }

    const cost = quantity * shopItem.valeResearchPoints;
    if (cost > currentResearchPoints) {
        return `You don't have enough Vale Research points to buy ${quantity.toLocaleString()}x ${shopItem.name} (${
			shopItem.valeResearchPoints
		} Vale Research points each).\nYou have ${currentResearchPoints} Vale Research points.\n${
			currentResearchPoints < shopItem.valeResearchPoints
				? "You don't have enough Vale Research points for any of this item."
				: `You only have enough for ${Math.floor(currentResearchPoints / shopItem.valeResearchPoints).toLocaleString()}`
		}`;
    }

    await handleMahojiConfirmation(
        interaction,
        `Are you sure you want to spent **${cost.toLocaleString()}** Vale Research points to buy **${quantity.toLocaleString()}x ${
            shopItem.name
        }**?`
    );

    await user.transactItems({
		collectionLog: true,
		itemsToAdd: new Bank(shopItem.output).multiply(quantity)
	});

    const { vale_research_points: newPoints } = await userStatsUpdate(
        user.id,
        {
            vale_research_points: {
                decrement: cost
            }
        },
        { vale_research_points: true }
    );

    return `You successfully bought **${quantity.toLocaleString()}x ${shopItem.name}** for ${(shopItem.valeResearchPoints * quantity).toLocaleString()} Vale Research points.\nYou now have ${newPoints} Vale Research points left.`;
}

export async function valeTotemsSellCommand(
    interaction: ChatInputCommandInteraction,
    user: MUser,
    item: string | undefined,
    quantity = 1
) {
    if (!user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun)) {
        return `${user.minionName} needs to complete the "Children of the Sun" quest before ${user.minionName} can access Vale Research Exchange. Send ${user.minionName} to do the quest using: ${mentionCommand(
            globalClient,
            'activities',
            'quest'
        )}.`;
    }

    const shopItem = ValeTotemsSellables.find(
        i => stringMatches(item, i.name) || i.aliases?.some(alias => stringMatches(alias, item))
    );
    if (!shopItem) {
        return `This is not a valid item to sell. These are the items that can be bought using Vale Research points: ${ValeTotemsSellables
            .map(v => v.name)
            .join(', ')}`;
    }

    const sellable = Items.getOrThrow(shopItem.name);
    const userBank = user.bank;
    const itemOwned = userBank.amount(sellable);

    if (!user.isIronman) {
        // Can't sell mask if not ironman
    }
}