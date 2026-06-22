export const primitiveTypes = ['string', 'bigint', 'number', 'boolean'] as const;

/**
 * Verify if the input is an object literal (or class).
 * @param input The object to verify
 */
export function isPlainObject(value: unknown): value is Record<PropertyKey, unknown> {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const proto = Object.getPrototypeOf(value);

	return proto === Object.prototype || proto === null;
}
export function isClassInstance(value: unknown): value is object {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	if (Array.isArray(value)) {
		return false;
	}

	const proto = Object.getPrototypeOf(value);

	return proto !== Object.prototype && proto !== null;
}
export function isObject(value: unknown): value is object {
	return isPlainObject(value) || isClassInstance(value);
}

export function isFunction(input: unknown): input is Function {
	return typeof input === 'function';
}

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
	return value !== null && value !== undefined;
}
