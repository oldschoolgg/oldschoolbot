import { KlasaUser } from "klasa";
import { Bank } from "oldschooljs";


export default function brewRestoreSupplyCalc(user: KlasaUser, brewsNeeded: number, restoresNeeded?: number): {foodBank: Bank, foodReason: string, hasEnough: boolean} {
	const userItems = user.bank().items();
	const itemBank = new Bank();

	let totalBrews = 0;
	const enhancedBrews = userItems.filter(([item]) => item.name.toLowerCase() === 'enhanced saradomin brew')[0] ?? [
		'',
		0
	];
	const brews = userItems.filter(([item]) => item.name.toLowerCase() === 'saradomin brew(4)')[0] ?? ['', 0];

	totalBrews += enhancedBrews[1] * 2;
	if (totalBrews >= brewsNeeded) itemBank.add('Enhanced Saradomin Brew', Math.ceil(brewsNeeded / 2));
	else {
		itemBank.add('Enhanced Saradomin Brew', enhancedBrews[1]);
		totalBrews += brews[1];
		if (totalBrews >= brewsNeeded) {
			itemBank.add('Saradomin Brew (4)', brewsNeeded - enhancedBrews[1] * 2);
		} else {
			return {
				hasEnough: false,
				foodBank: itemBank,
				foodReason: `Not enough saradomin brews. ${enhancedBrews[1]} enhanced & ${brews[1]} normal found, ${brewsNeeded} required (enhanced count for 2).`
      };
		}
	}

	if ( !restoresNeeded ) restoresNeeded = Math.max(1, Math.floor(brewsNeeded / 3));
	let totalRestores = 0;
	const enhancedRestores = userItems.filter(([item]) => item.name.toLowerCase() === 'enhanced super restore')[0] ?? [
		'',
		0
	];
	const restores = userItems.filter(([item]) => item.name.toLowerCase() === 'super restore(4)')[0] ?? ['', 0];

	totalRestores += enhancedRestores[1] * 2;
	if (totalRestores >= restoresNeeded) itemBank.add('Enhanced Super Restore', Math.ceil(restoresNeeded / 2));
	else {
		itemBank.add('Enhanced Super Restore', enhancedRestores[1]);
		totalRestores += restores[1];
		if (totalRestores >= restoresNeeded) {
			itemBank.add('Super Restore (4)', restoresNeeded - enhancedRestores[1] * 2);
		} else {
			return {
				hasEnough: false,
				foodBank: itemBank,
				foodReason: `Not enough super restores. ${enhancedRestores[1]} enhanced & ${restores[1]} normal found, ${restoresNeeded} required (enhanced count for 2).`
      };
		}
	}

	return {
    hasEnough: true, 
    foodBank: itemBank, 
    foodReason: ''
  };
}