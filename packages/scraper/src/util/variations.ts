type AnyObject = Record<string, unknown>;

export function splitVariations<T extends AnyObject>(obj: T): AnyObject[] {
	const suffixPattern = /_?(\d+)$/;

	const suffixes = new Set<number>();
	for (const key of Object.keys(obj)) {
		const match = key.match(suffixPattern);
		if (match) {
			suffixes.add(Number(match[1]));
		}
	}

	if (suffixes.size === 0) {
		return [{ ...obj }];
	}

	const sortedSuffixes = [...suffixes].sort((a, b) => a - b);

	return sortedSuffixes.map(suffixNum => {
		const variation: AnyObject = {};

		for (const [key, value] of Object.entries(obj)) {
			const match = key.match(suffixPattern);

			if (!match) {
				variation[key] = value;
			} else if (Number(match[1]) === suffixNum) {
				variation[key.replace(suffixPattern, '')] = value;
			}
		}

		return variation;
	});
}
