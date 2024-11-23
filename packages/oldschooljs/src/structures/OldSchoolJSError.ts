import { ErrorDescriptions, type Errors } from '../constants';

export default class OldSchoolJSError extends Error {
	public code: Errors;
	public description = '';

	public constructor(code: Errors) {
		super(code);
		this.name = this.constructor.name;
		this.code = code;
		this.message = ErrorDescriptions[code];
		if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
	}
}
