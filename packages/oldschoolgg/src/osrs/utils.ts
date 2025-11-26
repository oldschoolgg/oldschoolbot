export function generateHexColorForCashStack(coins: number): string {
    if (coins > 9_999_999) {
        return '#00FF80';
    }

    if (coins > 99_999) {
        return '#FFFFFF';
    }

    return '#FFFF00';
}

export function formatItemStackQuantity(quantity: number): string {
    if (quantity > 9_999_999) {
        return `${Math.floor(quantity / 1_000_000)}M`;
    } else if (quantity > 99_999) {
        return `${Math.floor(quantity / 1000)}K`;
    }
    return quantity.toString();
}

function round(value: number, precision = 1): number {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

export function toKMB(number: number): string {
    if (number > 999_999_999 || number < -999_999_999) {
        return `${round(number / 1_000_000_000)}b`;
    } else if (number > 999_999 || number < -999_999) {
        return `${round(number / 1_000_000)}m`;
    } else if (number > 999 || number < -999) {
        return `${round(number / 1000)}k`;
    }
    return round(number).toString();
}
