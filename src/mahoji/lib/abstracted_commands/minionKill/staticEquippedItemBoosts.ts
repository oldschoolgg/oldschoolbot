import type { Item } from "oldschooljs/dist/meta/types";
import type { PvMMethod } from "../../../../lib/constants";
import getOSItem from "../../../../lib/util/getOSItem";
import type { PrimaryGearSetupType } from "../../../../lib/gear/types";

interface StaticEquippedItemBoost {
    item: Item;
    attackStyle: PrimaryGearSetupType;
    anyRequiredPVMMethod: PvMMethod[];
    percentageBoost: number;
}

export const staticEquippedItemBoosts: StaticEquippedItemBoost[] = [
{
    item: getOSItem('Kodai wand'),
    attackStyle: 'mage',
    anyRequiredPVMMethod: ['barrage', 'burst'],
    percentageBoost: 15
}
];	


