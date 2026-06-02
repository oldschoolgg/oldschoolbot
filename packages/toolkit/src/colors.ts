export function isValidHexColor(hex: string): boolean {
	const isValid = hex.length === 7 && /^#([0-9A-F]{3}){1,2}$/i.test(hex);
	return isValid;
}

export function hexToDecimal(hex: string): number {
	let h = hex.trim().replace(/^#/, '').toLowerCase();
	if (h.length === 3 || h.length === 4) h = [...h].map(c => c + c).join('');
	if (!isValidHexColor(h)) throw new Error('Invalid hex');
	return parseInt(h, 16);
}
