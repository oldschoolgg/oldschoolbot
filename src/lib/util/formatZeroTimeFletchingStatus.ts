import type { Fletchable } from '@/lib/skilling/types.js';

export function formatZeroTimeFletchingStatus(quantity: number, fletchable: Fletchable): string {
	const setsText = fletchable.outputMultiple ? ' sets of' : '';
	return `They are also fletching ${quantity}${setsText} ${fletchable.name}.`;
}
