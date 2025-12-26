export const primitiveTypes = ['string', 'bigint', 'number', 'boolean'] as const;

/**
 * Verify if the input is an object literal (or class).
 * @param input The object to verify
 */
export function isObject(input: unknown): input is Record<PropertyKey, unknown> | object {
	return typeof input === 'object' && input ? input.constructor === Object : false;
}

export function isFunction(input: unknown): input is Function {
	return typeof input === 'function';
}

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
	return value !== null && value !== undefined;
}
