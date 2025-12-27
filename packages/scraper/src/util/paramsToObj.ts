import type { TemplateParam } from '../parser/types.js';
import { nodesToText } from '../parser/utils.js';

export function paramsToObj(values: TemplateParam[]) {
	if (typeof values === 'undefined') {
		throw new Error(`Received undefined values`);
	}
	const output: Record<string, unknown> = {};
	for (const param of values.sort((a, b) => (a.name || '').localeCompare(b.name || ''))) {
		if (!param.name) {
			console.warn(`${JSON.stringify(param)} has no name`);
			continue;
		}
		const value = nodesToText(param.value).trim();
		output[param.name!] = value;
	}

	return output;
}
