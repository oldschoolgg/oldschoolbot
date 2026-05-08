type ItemPrice = {
	high: number;
	highTime: number;
	low: number;
	lowTime: number;
};

export async function fetchPrices() {
	const allPrices = await fetch('https://prices.runescape.wiki/api/v1/osrs/latest', {
		headers: {
			'User-Agent': 'oldschooljs - @magnaboy'
		}
	})
		.then((res): Promise<any> => res.json())
		.then(res => res.data);

	if (!allPrices[20_997]) {
		throw new Error('Failed to fetch prices');
	}

	return allPrices as { [key: string]: ItemPrice };
}
