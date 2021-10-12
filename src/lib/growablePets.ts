const kittens = [1555, 1556, 1557, 1558, 1559, 1560] as const;
const cats = [1561, 1562, 1563, 1564, 1565, 1566] as const;

interface GrowablePet {
	growthChancePerHour: number;
	stages: number[];
}

const growablePets: GrowablePet[] = [];

for (let i = 0; i < kittens.length; i++) {
	growablePets.push({
		growthChancePerHour: 2,
		stages: [kittens[i], cats[i]]
	});
}
