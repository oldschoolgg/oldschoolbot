'use strict';

const { setTimeout, clearTimeout } = require('node:timers');
const { Collection } = require('@discordjs/collection');
const { AsyncEventEmitter } = require('@vladfrangu/async_event_emitter');
const { DiscordjsTypeError, ErrorCodes } = require('../../errors/index.js');
const { flatten } = require('../../util/Util.js');

class Collector extends AsyncEventEmitter {
	constructor(client, options = {}) {
		super();

		Object.defineProperty(this, 'client', { value: client });
		this.filter = options.filter ?? (() => true);
		this.options = options;
		this.collected = new Collection();
		this.ended = false;
		this._timeout = null;
		this._idletimeout = null;
		this._endReason = null;

		if (typeof this.filter !== 'function') {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'options.filter', 'function');
		}

		this.handleCollect = this.handleCollect.bind(this);
		this.handleDispose = this.handleDispose.bind(this);

		if (options.time) this._timeout = setTimeout(() => this.stop('time'), options.time).unref();
		if (options.idle) this._idletimeout = setTimeout(() => this.stop('idle'), options.idle).unref();
		this.lastCollectedTimestamp = null;
	}

	get lastCollectedAt() {
		return this.lastCollectedTimestamp && new Date(this.lastCollectedTimestamp);
	}


	async handleCollect(...args) {
		const collectedId = await this.collect(...args);

		if (collectedId) {
			const filterResult = await this.filter(...args, this.collected);
			if (filterResult) {
				this.collected.set(collectedId, args[0]);

				this.emit('collect', ...args);

				this.lastCollectedTimestamp = Date.now();
				if (this._idletimeout) {
					clearTimeout(this._idletimeout);
					this._idletimeout = setTimeout(() => this.stop('idle'), this.options.idle).unref();
				}
			} else {

				this.emit('ignore', ...args);
			}
		}

		this.checkEnd();
	}

	/**
	 * Call this to remove an element from the collection. Accepts any event data as parameters.
	 *
	 * @param {...*} args The arguments emitted by the listener
	 * @returns {Promise<void>}
	 * @emits Collector#dispose
	 */
	async handleDispose(...args) {
		if (!this.options.dispose) return;

		const dispose = this.dispose(...args);
		if (!dispose || !(await this.filter(...args)) || !this.collected.has(dispose)) return;
		this.collected.delete(dispose);

		/**
		 * Emitted whenever an element is disposed of.
		 *
		 * @event Collector#dispose
		 * @param {...*} args The arguments emitted by the listener
		 */
		this.emit('dispose', ...args);
		this.checkEnd();
	}

	/**
	 * Returns a promise that resolves with the next collected element;
	 * rejects with collected elements if the collector finishes without receiving a next element
	 *
	 * @type {Promise}
	 * @readonly
	 */
	get next() {
		return new Promise((resolve, reject) => {
			if (this.ended) {
				reject(this.collected);
				return;
			}

			const cleanup = () => {
				// eslint-disable-next-line no-use-before-define
				this.removeListener('collect', onCollect);
				// eslint-disable-next-line no-use-before-define
				this.removeListener('end', onEnd);
			};

			const onCollect = item => {
				cleanup();
				resolve(item);
			};

			const onEnd = () => {
				cleanup();
				reject(this.collected);
			};

			this.on('collect', onCollect);
			this.on('end', onEnd);
		});
	}

	/**
	 * Stops this collector and emits the `end` event.
	 *
	 * @param {string} [reason='user'] The reason this collector is ending
	 * @emits Collector#end
	 */
	stop(reason = 'user') {
		if (this.ended) return;

		if (this._timeout) {
			clearTimeout(this._timeout);
			this._timeout = null;
		}

		if (this._idletimeout) {
			clearTimeout(this._idletimeout);
			this._idletimeout = null;
		}

		this._endReason = reason;
		this.ended = true;

		/**
		 * Emitted when the collector is finished collecting.
		 *
		 * @event Collector#end
		 * @param {Collection} collected The elements collected by the collector
		 * @param {string} reason The reason the collector ended
		 */
		this.emit('end', this.collected, reason);
	}

	/**
	 * Options used to reset the timeout and idle timer of a {@link Collector}.
	 *
	 * @typedef {Object} CollectorResetTimerOptions
	 * @property {number} [time] How long to run the collector for (in milliseconds)
	 * @property {number} [idle] How long to wait to stop the collector after inactivity (in milliseconds)
	 */

	/**
	 * Resets the collector's timeout and idle timer.
	 *
	 * @param {CollectorResetTimerOptions} [options] Options for resetting
	 */
	resetTimer({ time, idle } = {}) {
		if (this._timeout) {
			clearTimeout(this._timeout);
			this._timeout = setTimeout(() => this.stop('time'), time ?? this.options.time).unref();
		}

		if (this._idletimeout) {
			clearTimeout(this._idletimeout);
			this._idletimeout = setTimeout(() => this.stop('idle'), idle ?? this.options.idle).unref();
		}
	}

	/**
	 * Checks whether the collector should end, and if so, ends it.
	 *
	 * @returns {boolean} Whether the collector ended or not
	 */
	checkEnd() {
		const reason = this.endReason;
		if (reason) this.stop(reason);
		return Boolean(reason);
	}

	/**
	 * Allows collectors to be consumed with for-await-of loops
	 *
	 * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/for-await...of}
	 */
	async *[Symbol.asyncIterator]() {
		const queue = [];
		const onCollect = (...item) => queue.push(item);
		this.on('collect', onCollect);

		try {
			while (queue.length || !this.ended) {
				if (queue.length) {
					yield queue.shift();
				} else {
					await new Promise(resolve => {
						const tick = () => {
							this.removeListener('collect', tick);
							this.removeListener('end', tick);
							resolve();
						};

						this.on('collect', tick);
						this.on('end', tick);
					});
				}
			}
		} finally {
			this.removeListener('collect', onCollect);
		}
	}

	toJSON() {
		return flatten(this);
	}

	get endReason() {
		return this._endReason;
	}

	// eslint-disable-next-line no-unused-vars
	collect(...args) { }

	// eslint-disable-next-line no-unused-vars
	dispose(...args) { }
}

exports.Collector = Collector;
