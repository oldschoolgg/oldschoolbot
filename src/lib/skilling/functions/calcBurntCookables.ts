export function calcBurntCookables({
	rng,
	qtyCooking,
	stopBurningLvl,
	cookingLvl
}: {
	rng: RNGProvider;
	qtyCooking: number;
	stopBurningLvl: number;
	cookingLvl: number;
}) {
	let burnedAmount = 0;
	for (let i = 0; i < qtyCooking; i++) {
		if (rng.randInt(0, 100) < stopBurningLvl - cookingLvl) {
			burnedAmount++;
		}
	}
	return burnedAmount;
}
