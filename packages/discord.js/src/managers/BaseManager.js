'use strict';

class BaseManager {
	constructor(client) {
		Object.defineProperty(this, 'client', { value: client });
	}
}

exports.BaseManager = BaseManager;
