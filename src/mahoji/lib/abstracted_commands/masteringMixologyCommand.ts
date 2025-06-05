import { Time } from "e";
import { calcMaxTripLength } from "../../../lib/util/calcMaxTripLength";
import { QuestID } from "../../../lib/minions/data/quests";
import { formatDuration, mentionCommand } from "@oldschoolgg/toolkit";
import { SkillsEnum } from "../../../lib/skilling/types";
import { Bank } from "oldschooljs/dist/meta/types";
import { updateBankSetting } from "../../../lib/util/updateBankSetting";
import addSubTaskToActivityTask from "../../../lib/util/addSubTaskToActivityTask";
import type { MasteringMixologyContractActivityTaskOptions, MasteringMixologyContractCreatingTaskOptions } from "../../../lib/types/minions";

export interface MixologyHerb {
	name: string;
	paste: 'Mox' | 'Lye' | 'Aga';
	quantity: number;
}

export const mixologyHerbs: MixologyHerb[] = [
	{ name: 'Guam leaf', paste: 'Mox', quantity: 10 },
	{ name: 'Marrentill', paste: 'Mox', quantity: 13 },
	{ name: 'Tarromin', paste: 'Mox', quantity: 15 },
	{ name: 'Harralander', paste: 'Mox', quantity: 20 },
	{ name: 'Ranarr weed', paste: 'Lye', quantity: 26 },
	{ name: 'Toadflax', paste: 'Lye', quantity: 32 },
	{ name: 'Irit leaf', paste: 'Aga', quantity: 30 },
	{ name: 'Avantoe', paste: 'Lye', quantity: 30 },
	{ name: 'Kwuarm', paste: 'Lye', quantity: 33 },
	{ name: 'Huasca', paste: 'Aga', quantity: 20 },
	{ name: 'Snapdragon', paste: 'Lye', quantity: 40 },
	{ name: 'Cadantine', paste: 'Aga', quantity: 34 },
	{ name: 'Lantadyme', paste: 'Aga', quantity: 40 },
	{ name: 'Dwarf weed', paste: 'Aga', quantity: 42 },
	{ name: 'Torstol', paste: 'Aga', quantity: 44 }
];

export async function MixologyPasteCreationCommand(user: MUser, channelID: string, herbName: string, quantity?: number) {
	const herb = mixologyHerbs.find(h => h.name.toLowerCase() === herbName.toLowerCase());
	if (!herb) {
		return "That is not a valid herb for mixology paste.";
	}

	const userHerbQty = user.bank.amount(herb.name);
	if (userHerbQty === 0) {
		return `You don't have any ${herb.name} to convert into ${herb.paste} paste.`;
	}

	const usedQty = quantity ?? userHerbQty;
	if (usedQty < 1 || usedQty > userHerbQty) {
		return `You can only use between 1 and ${userHerbQty} ${herb.name}.`;
	}

	const pasteYield = usedQty * herb.quantity;
	const duration = usedQty * 0.6 * 1000; // in ms

    const herbsNeeded = new Bank().add(herb.name, usedQty)

	await user.removeItemsFromBank(herbsNeeded);
	
    
    await updateBankSetting('mastering_mixology_cost_bank', herbsNeeded);

    await addSubTaskToActivityTask<MasteringMixologyContractCreatingTaskOptions>({
            userID: user.id,
            channelID: channelID.toString(),
            type: 'MixologyPasteCreation',
            minigameID: 'mastering_mixology',
			herbName: herb.name,
            quantity: usedQty,
            duration,
        });
    
        const str = `You are using ${usedQty}x ${herb.name} to create ${pasteYield}x ${herb.paste} paste. This will take ${formatDuration(duration)}.`;

        return str
}


function getContractDuration(base: number): number {
	const variance = 0.1;
	const factor = 1 + (Math.random() * 2 - 1) * variance;
	return base * factor;
}



export async function MasteringMixologyContractStartCommand(user: MUser, channelID: string, contracts?: number) {

    const currentLevel = user.skillLevel(SkillsEnum.Herblore);

    if (currentLevel < 60) return "You need at least 60 Herblore to participate in the mixology."

    if (!user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun)) {
            return `You need to complete the "Children of the Sun" quest before you can participate in the mixology. Send your minion to do the quest using: ${mentionCommand(
                globalClient,
                'activities',
                'quest'
            )}.`;
        }
	const contractTime = Time.Minute * 3;
	const maxTripLength = calcMaxTripLength(user, 'MasteringMixologyContract');
	const maxContracts = Math.floor(maxTripLength / contractTime);

	if (!contracts) {
		contracts = maxContracts;
	}

    if (contracts < 1 || contracts > maxContracts) {
		return `You can only complete between 1 and ${maxContracts} contracts based on your current max trip length.`;
	}
    let totalDuration = 0;
for (let i = 0; i < contracts; i++) {
	totalDuration += getContractDuration(contractTime);
}
const duration = Math.round(totalDuration);

await addSubTaskToActivityTask<MasteringMixologyContractActivityTaskOptions>({
	userID: user.id,
	channelID: channelID.toString(),
	type: 'MasteringMixologyContract',
	duration,
	minigameID: 'mastering_mixology',
	quantity: contracts,
});




	return `${user.minionName} is now doing ${contracts} Mastering Mixology contract${contracts > 1 ? 's' : ''}. The trip will take ${formatDuration(duration)}.`;
}
