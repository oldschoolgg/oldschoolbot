import { rand } from '../../util';

export default function calcBurntCookables(qtyCooking: number, stopBurningLvl: number, cookingLvl: number) {
	let burnedAmount = 0;
	for (let i = 0; i < qtyCooking; i++) {
		if (rand(0, 100) < stopBurningLvl - cookingLvl) {
			burnedAmount++;
		}
	}
	return burnedAmount;
}
