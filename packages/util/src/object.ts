/**
 * Verify if the input is an object literal (or class).
 * @param input The object to verify
 */
export function isObject(input: unknown): input is Record<PropertyKey, unknown> | object {
	return typeof input === 'object' && input ? input.constructor === Object : false;
}

type AnyObject = Record<string, unknown>;

function toSnakeCaseKey(key: string): string {
	return key
		.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
		.replace(/[-\s]+/g, '_')
		.toLowerCase();
}

export function objectToSnakeCase<T>(input: T): T {
	if (Array.isArray(input)) {
		return input.map(v => objectToSnakeCase(v)) as T;
	}

	if (input !== null && typeof input === 'object') {
		const out: AnyObject = {};
		for (const [k, v] of Object.entries(input as AnyObject)) {
			out[toSnakeCaseKey(k)] = objectToSnakeCase(v);
		}
		return out as T;
	}

	return input;
}
