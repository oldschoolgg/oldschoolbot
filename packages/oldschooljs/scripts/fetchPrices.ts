type ItemPrice = {
	high: number;
	highTime: number;
	low: number;
	lowTime: number;
};

export async function fetchPrices() {
	const response = await fetch('https://prices.runescape.wiki/api/v1/osrs/latest', {
		headers: {
			'User-Agent': 'oldschooljs - @magnaboy'
		}
	});
	if (!response.ok) throw new Error(`Failed to fetch prices: ${response.status} ${response.statusText}`);
	const allPrices = ((await response.json()) as any).data;

	if (!allPrices[20_997]) {
		throw new Error('Failed to fetch prices');
	}

	return allPrices as { [key: string]: ItemPrice };
}
